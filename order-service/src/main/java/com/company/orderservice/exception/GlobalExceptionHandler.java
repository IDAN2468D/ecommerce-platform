package com.company.orderservice.exception;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.micrometer.tracing.Tracer;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ProblemDetail;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingRequestHeaderException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.ServletWebRequest;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.net.URI;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
@RequiredArgsConstructor
@Slf4j
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    private final Tracer tracer;

    private void enrichProblemDetail(ProblemDetail problem, HttpServletRequest request) {
        problem.setProperty("timestamp", Instant.now());
        if (request != null) {
            problem.setInstance(URI.create(request.getRequestURI()));
        }
        if (tracer != null && tracer.currentSpan() != null) {
            problem.setProperty("traceId", tracer.currentSpan().context().traceId());
        }
    }

    @ExceptionHandler(InsufficientInventoryException.class)
    public ResponseEntity<ProblemDetail> handleInsufficientInventory(
            InsufficientInventoryException ex, HttpServletRequest request) {
        log.warn("Insufficient inventory: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.CONFLICT, ex.getMessage());
        problem.setTitle("Insufficient Inventory");
        problem.setType(URI.create("https://api.company.com/errors/insufficient-inventory"));
        enrichProblemDetail(problem, request);
        return ResponseEntity.status(HttpStatus.CONFLICT).body(problem);
    }

    @ExceptionHandler(OrderNotFoundException.class)
    public ResponseEntity<ProblemDetail> handleOrderNotFound(
            OrderNotFoundException ex, HttpServletRequest request) {
        log.warn("Order not found: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.NOT_FOUND, ex.getMessage());
        problem.setTitle("Order Not Found");
        problem.setType(URI.create("https://api.company.com/errors/order-not-found"));
        enrichProblemDetail(problem, request);
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(problem);
    }

    @ExceptionHandler(PaymentFailedException.class)
    public ResponseEntity<ProblemDetail> handlePaymentFailed(
            PaymentFailedException ex, HttpServletRequest request) {
        log.error("Payment failed: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.PAYMENT_REQUIRED, ex.getMessage());
        problem.setTitle("Payment Failed");
        problem.setType(URI.create("https://api.company.com/errors/payment-failed"));
        enrichProblemDetail(problem, request);
        return ResponseEntity.status(HttpStatus.PAYMENT_REQUIRED).body(problem);
    }

    @ExceptionHandler(OrderCannotBeCancelledException.class)
    public ResponseEntity<ProblemDetail> handleOrderCannotBeCancelled(
            OrderCannotBeCancelledException ex, HttpServletRequest request) {
        log.warn("Cannot cancel order: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.BAD_REQUEST, ex.getMessage());
        problem.setTitle("Order Cancellation Disallowed");
        problem.setType(URI.create("https://api.company.com/errors/order-cannot-be-cancelled"));
        enrichProblemDetail(problem, request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ProblemDetail> handleAccessDenied(
            AccessDeniedException ex, HttpServletRequest request) {
        log.warn("Access denied: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(HttpStatus.FORBIDDEN, "Access denied to requested resource");
        problem.setTitle("Access Denied");
        problem.setType(URI.create("https://api.company.com/errors/access-denied"));
        enrichProblemDetail(problem, request);
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(problem);
    }

    @ExceptionHandler(CallNotPermittedException.class)
    public ResponseEntity<ProblemDetail> handleCircuitBreakerOpen(
            CallNotPermittedException ex, HttpServletRequest request) {
        log.error("Circuit breaker is OPEN: {}", ex.getMessage());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.SERVICE_UNAVAILABLE, "Dependent downstream service is temporarily unavailable. Please try again later.");
        problem.setTitle("Service Unavailable");
        problem.setType(URI.create("https://api.company.com/errors/circuit-breaker-open"));
        enrichProblemDetail(problem, request);
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(problem);
    }

    @ExceptionHandler(MissingRequestHeaderException.class)
    public ResponseEntity<ProblemDetail> handleMissingHeader(
            MissingRequestHeaderException ex, HttpServletRequest request) {
        log.warn("Missing required header: {}", ex.getHeaderName());
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Required request header '" + ex.getHeaderName() + "' is not present.");
        problem.setTitle("Missing Request Header");
        problem.setType(URI.create("https://api.company.com/errors/missing-header"));
        enrichProblemDetail(problem, request);
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(
            MethodArgumentNotValidException ex,
            HttpHeaders headers,
            HttpStatusCode status,
            WebRequest request) {

        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fieldErrors.put(error.getField(), error.getDefaultMessage());
        }

        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.BAD_REQUEST, "Validation failed for request arguments.");
        problem.setTitle("Validation Error");
        problem.setType(URI.create("https://api.company.com/errors/validation-error"));
        problem.setProperty("invalidFields", fieldErrors);
        problem.setProperty("timestamp", Instant.now());

        if (request instanceof ServletWebRequest servletWebRequest) {
            enrichProblemDetail(problem, servletWebRequest.getRequest());
        }

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(problem);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ProblemDetail> handleGenericException(Exception ex, HttpServletRequest request) {
        log.error("Unexpected internal server error: ", ex);
        ProblemDetail problem = ProblemDetail.forStatusAndDetail(
                HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred. Please contact support.");
        problem.setTitle("Internal Server Error");
        problem.setType(URI.create("https://api.company.com/errors/internal-error"));
        enrichProblemDetail(problem, request);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(problem);
    }
}
