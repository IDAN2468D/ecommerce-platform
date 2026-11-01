package com.company.ragservice.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Controller
public class RootController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    @ResponseBody
    public ResponseEntity<String> index() {
        try {
            Resource resource = new ClassPathResource("static/index.html");
            String content = new String(resource.getInputStream().readAllBytes(), StandardCharsets.UTF_8);
            return ResponseEntity.ok(content);
        } catch (IOException e) {
            return ResponseEntity.status(302).header("Location", "/swagger-ui/index.html").build();
        }
    }

    @GetMapping("/swagger")
    public String swaggerRedirect() {
        return "redirect:/swagger-ui/index.html";
    }
}
