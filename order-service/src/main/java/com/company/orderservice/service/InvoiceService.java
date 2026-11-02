package com.company.orderservice.service;

import com.company.orderservice.domain.entity.OrderEntity;
import com.company.orderservice.domain.entity.OrderItemEntity;
import com.company.orderservice.domain.enums.OrderStatus;
import com.company.orderservice.exception.OrderNotFoundException;
import com.company.orderservice.repository.OrderRepository;
import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.text.DecimalFormat;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvoiceService {

    private final OrderRepository orderRepository;
    private static final BigDecimal VAT_RATE = new BigDecimal("0.18"); // 18% VAT Israel
    private static final DecimalFormat CURRENCY_FORMAT = new DecimalFormat("#,##0.00");

    private static final Map<String, String> PRODUCT_CATALOG_HE = Map.ofEntries(
        Map.entry("IPHONE-16-PRO-256", "Apple iPhone 16 Pro 256GB טיטניום מדברי"),
        Map.entry("MACBOOK-PRO-M3", "Apple MacBook Pro 14 M3 Pro 18GB 512GB"),
        Map.entry("WATCH-ULTRA-2", "Apple Watch Ultra 2 GPS + Cellular טיטניום 49 מ\"מ"),
        Map.entry("AIRPODS-MAX", "Apple AirPods Max USB-C אוזניות פרימיום"),
        Map.entry("AIRPODS-PRO-2", "Apple AirPods Pro (דור 2) USB-C עם MagSafe"),
        Map.entry("IPAD-PRO-M4", "Apple iPad Pro 11 אינץ' M4 256GB OLED"),
        Map.entry("SAMSUNG-S24-ULTRA", "Samsung Galaxy S24 Ultra 512GB Titanium"),
        Map.entry("PS5-PRO", "Sony PlayStation 5 Pro 2TB Console קונסולה"),
        Map.entry("SONY-WH-1000XM5", "Sony WH-1000XM5 אוזניות ביטול רעשים"),
        Map.entry("DJI-MINI-4-PRO", "DJI Mini 4 Pro Drone רחפן מקצועי קומבו"),
        Map.entry("SKU-LAPTOP-PRO", "Dell XPS 15 OLED Intel Core i9 32GB"),
        Map.entry("SKU-MOUSE-WIRELESS", "Logitech MX Master 3S עכבר אלחוטי ארגונומי"),
        Map.entry("CASE-CLEAR-MAGSAFE", "כיסוי מגן שקוף MagSafe ל-iPhone 16")
    );

    public byte[] generateInvoicePdf(UUID orderId) {
        log.info("Generating Hebrew PDF invoice for orderId: {}", orderId);
        OrderEntity order = orderRepository.findById(orderId)
                .orElseThrow(() -> new OrderNotFoundException(orderId));

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        Document document = new Document(PageSize.A4, 28, 28, 30, 28);

        try {
            PdfWriter writer = PdfWriter.getInstance(document, baos);
            document.open();

            // Load Hebrew TrueType Fonts (Windows Arial / Arial Bold)
            BaseFont bfReg = loadBaseFont("/fonts/arial.ttf", "arial.ttf", false);
            BaseFont bfBold = loadBaseFont("/fonts/arialbd.ttf", "arialbd.ttf", true);

            // Cohesive Design System Palette
            Color primaryNavy = new Color(15, 23, 42);      // #0F172A
            Color accentBlue = new Color(30, 58, 138);       // #1E3A8A
            Color headerSlate = new Color(30, 41, 59);       // #1E293B
            Color mutedSlate = new Color(100, 116, 139);     // #64748B
            Color textDark = new Color(15, 23, 42);          // #0F172A
            Color borderLight = new Color(226, 232, 240);    // #E2E8F0
            Color zebraLight = new Color(248, 250, 252);     // #F8FAFC
            Color emeraldBg = new Color(236, 253, 245);      // #ECFDF5
            Color emeraldBorder = new Color(16, 185, 129);   // #10B981
            Color emeraldText = new Color(4, 120, 87);       // #047857
            Color totalBg = new Color(239, 246, 255);        // #EFF6FF
            Color totalBorder = new Color(59, 130, 246);     // #3B82F6

            // Typography Styles
            Font fontCompanyTitle = new Font(bfBold, 16, Font.NORMAL, primaryNavy);
            Font fontCompanySub = new Font(bfReg, 8f, Font.NORMAL, mutedSlate);
            Font fontDocTitle = new Font(bfBold, 15, Font.NORMAL, accentBlue);
            Font fontDocBadge = new Font(bfBold, 9.5f, Font.NORMAL, new Color(71, 85, 105));
            Font fontSectionHeader = new Font(bfBold, 9.5f, Font.NORMAL, primaryNavy);
            Font fontLabel = new Font(bfBold, 8.5f, Font.NORMAL, mutedSlate);
            Font fontValue = new Font(bfReg, 8.5f, Font.NORMAL, textDark);
            Font fontValueBold = new Font(bfBold, 8.5f, Font.NORMAL, textDark);
            Font fontTableHeader = new Font(bfBold, 8.5f, Font.NORMAL, Color.WHITE);
            Font fontTableCell = new Font(bfReg, 8.5f, Font.NORMAL, textDark);
            Font fontTableCellBold = new Font(bfBold, 8.5f, Font.NORMAL, textDark);
            Font fontBadge = new Font(bfBold, 8.5f, Font.NORMAL, emeraldText);
            Font fontTotalLabel = new Font(bfBold, 9.5f, Font.NORMAL, textDark);
            Font fontTotalValue = new Font(bfBold, 11.5f, Font.NORMAL, accentBlue);
            Font fontFooter = new Font(bfReg, 7.5f, Font.NORMAL, mutedSlate);

            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm:ss")
                    .withZone(ZoneId.of("Asia/Jerusalem"));
            String orderDate = formatter.format(order.getCreatedAt());

            // ==========================================
            // 1. HEADER (Top Right: Company, Top Left: Document Badge)
            // ==========================================
            PdfPTable headerTable = new PdfPTable(2);
            headerTable.setWidthPercentage(100);
            headerTable.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            // In OpenPDF RTL: setWidths sets physical columns Left to Right: [Left=DocBadge, Right=Company]
            headerTable.setWidths(new float[]{1.0f, 1.4f});

            // Company Info (Right Cell in RTL)
            PdfPCell cComp = new PdfPCell();
            cComp.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            cComp.setBorder(Rectangle.NO_BORDER);
            cComp.setPaddingBottom(8);

            // Note: In OpenPDF RTL mode, ALIGN_LEFT aligns to physical Right
            Paragraph p1 = new Paragraph("אי-קומרס אנטרפרייז בע\"מ", fontCompanyTitle);
            p1.setAlignment(Element.ALIGN_LEFT);
            Paragraph p2 = new Paragraph("פלטפורמת מסחר אלקטרוני מבוזרת וסליקה מאובטחת", fontCompanySub);
            p2.setAlignment(Element.ALIGN_LEFT);
            Paragraph p3 = new Paragraph("ח.פ / ע.מ: 515829104  |  תיק מע\"מ: תל אביב 1", fontCompanySub);
            p3.setAlignment(Element.ALIGN_LEFT);
            Paragraph p4 = new Paragraph("דרך מנחם בגין 144, מגדל מידטאון, תל אביב-יפו", fontCompanySub);
            p4.setAlignment(Element.ALIGN_LEFT);
            Paragraph p5 = new Paragraph("שירות לקוחות: 03-9123456  |  support@ecommerce.co.il", fontCompanySub);
            p5.setAlignment(Element.ALIGN_LEFT);

            cComp.addElement(p1);
            cComp.addElement(p2);
            cComp.addElement(p3);
            cComp.addElement(p4);
            cComp.addElement(p5);
            headerTable.addCell(cComp);

            // Document Badge (Left Cell in RTL)
            PdfPCell cDoc = new PdfPCell();
            cDoc.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            cDoc.setBackgroundColor(zebraLight);
            cDoc.setBorderColor(borderLight);
            cDoc.setBorderWidth(1f);
            cDoc.setPadding(8);
            cDoc.setHorizontalAlignment(Element.ALIGN_CENTER);

            Paragraph t1 = new Paragraph("חשבונית מס / קבלה", fontDocTitle);
            t1.setAlignment(Element.ALIGN_CENTER);
            Paragraph t2 = new Paragraph("מקור נאמן למקור", fontDocBadge);
            t2.setAlignment(Element.ALIGN_CENTER);
            Paragraph t3 = new Paragraph("מסמך ממוחשב מאושר ע\"פ הוראות מס הכנסה", fontCompanySub);
            t3.setAlignment(Element.ALIGN_CENTER);

            cDoc.addElement(t1);
            cDoc.addElement(t2);
            cDoc.addElement(t3);
            headerTable.addCell(cDoc);

            document.add(headerTable);
            document.add(createDivider(borderLight));

            // ==========================================
            // 2. METADATA: 2 Cards (Right: Order, Left: Customer)
            // ==========================================
            PdfPTable metaContainer = new PdfPTable(2);
            metaContainer.setWidthPercentage(100);
            metaContainer.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            metaContainer.setWidths(new float[]{1f, 1f});

            // Right Card: Order & Document Details
            PdfPCell orderCell = new PdfPCell();
            orderCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            orderCell.setBackgroundColor(zebraLight);
            orderCell.setBorderColor(borderLight);
            orderCell.setPadding(8);

            Paragraph ho = new Paragraph("פרטי המסמך וההזמנה", fontSectionHeader);
            ho.setAlignment(Element.ALIGN_LEFT);
            orderCell.addElement(ho);
            orderCell.addElement(new Paragraph(" ", new Font(bfReg, 2)));

            PdfPTable tOrderKv = new PdfPTable(2);
            tOrderKv.setWidthPercentage(100);
            tOrderKv.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            // Physical LTR: [Left=Value, Right=Label]
            tOrderKv.setWidths(new float[]{1.6f, 0.9f});

            String shortOrderId = order.getId().toString().substring(0, 8).toUpperCase();
            addKv(tOrderKv, "מספר חשבונית:", "INV-" + shortOrderId, fontLabel, fontValueBold);
            addKv(tOrderKv, "תאריך ושעה:", orderDate, fontLabel, fontValue);
            addKv(tOrderKv, "מזהה הזמנה:", order.getId().toString(), fontLabel, fontValue);
            addKv(tOrderKv, "סטטוס הזמנה:", getStatusHebrew(order.getStatus()), fontLabel, fontValueBold);
            orderCell.addElement(tOrderKv);
            metaContainer.addCell(orderCell);

            // Left Card: Customer & Payment Details
            PdfPCell custCell = new PdfPCell();
            custCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            custCell.setBackgroundColor(zebraLight);
            custCell.setBorderColor(borderLight);
            custCell.setPadding(8);

            Paragraph hc = new Paragraph("פרטי לקוח ותשלום", fontSectionHeader);
            hc.setAlignment(Element.ALIGN_LEFT);
            custCell.addElement(hc);
            custCell.addElement(new Paragraph(" ", new Font(bfReg, 2)));

            PdfPTable tCustKv = new PdfPTable(2);
            tCustKv.setWidthPercentage(100);
            tCustKv.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            // Physical LTR: [Left=Value, Right=Label]
            tCustKv.setWidths(new float[]{1.6f, 0.9f});

            String customerLabel = order.getCustomerId() != null ? order.getCustomerId() : "לקוח פלטפורמה";
            if ("usr_demo".equals(order.getCustomerId())) {
                customerLabel = "usr_demo (עידן קדם)";
            }
            addKv(tCustKv, "לכבוד לקוח:", customerLabel, fontLabel, fontValueBold);
            addKv(tCustKv, "אופן תשלום:", "כרטיס אשראי (סליקה מקוונת)", fontLabel, fontValue);
            String txId = order.getPaymentTransactionId() != null ? order.getPaymentTransactionId() : "tx_saga_approved";
            addKv(tCustKv, "אישור עסקה:", txId, fontLabel, fontValue);
            addKv(tCustKv, "מטבע חיוב:", "שקל חדש (₪ ILS)", fontLabel, fontValueBold);
            custCell.addElement(tCustKv);
            metaContainer.addCell(custCell);

            document.add(metaContainer);
            document.add(new Paragraph(" ", new Font(bfReg, 3)));

            // ==========================================
            // 3. SAGA BADGE
            // ==========================================
            PdfPTable badgeTable = new PdfPTable(1);
            badgeTable.setWidthPercentage(100);
            badgeTable.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);

            PdfPCell badgeCell = new PdfPCell();
            badgeCell.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            badgeCell.setBackgroundColor(emeraldBg);
            badgeCell.setBorderColor(emeraldBorder);
            badgeCell.setPadding(5);

            Paragraph bp = new Paragraph("✓ מאושר ומאומת ע\"י מנוע טרנזקציות מבוזר SAGA (שלב 5: הזמנה נסלקה ושריון משלוח אושר)", fontBadge);
            bp.setAlignment(Element.ALIGN_CENTER);
            badgeCell.addElement(bp);
            badgeTable.addCell(badgeCell);
            document.add(badgeTable);

            document.add(new Paragraph(" ", new Font(bfReg, 4)));

            // ==========================================
            // 4. ITEMS TABLE (5 Columns RTL)
            // ==========================================
            PdfPTable itemsTable = new PdfPTable(5);
            itemsTable.setWidthPercentage(100);
            itemsTable.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            // Physical LTR order: [Total, Price, Qty, Desc, SKU]
            itemsTable.setWidths(new float[]{1.5f, 1.5f, 0.8f, 4.4f, 1.8f});

            addHead(itemsTable, "מק\"ט", fontTableHeader, headerSlate, Element.ALIGN_CENTER);
            addHead(itemsTable, "תיאור המוצר", fontTableHeader, headerSlate, Element.ALIGN_LEFT);
            addHead(itemsTable, "כמות", fontTableHeader, headerSlate, Element.ALIGN_CENTER);
            addHead(itemsTable, "מחיר יחידה", fontTableHeader, headerSlate, Element.ALIGN_RIGHT);
            addHead(itemsTable, "סה\"כ שורה", fontTableHeader, headerSlate, Element.ALIGN_RIGHT);

            BigDecimal subtotal = BigDecimal.ZERO;
            boolean isZebra = false;

            if (order.getItems() != null && !order.getItems().isEmpty()) {
                for (OrderItemEntity item : order.getItems()) {
                    BigDecimal lineTotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                    subtotal = subtotal.add(lineTotal);

                    Color rowBg = isZebra ? zebraLight : Color.WHITE;
                    isZebra = !isZebra;

                    String productName = PRODUCT_CATALOG_HE.getOrDefault(item.getSkuCode(), "מוצר אלקטרוניקה (" + item.getSkuCode() + ")");

                    addItem(itemsTable,
                            item.getSkuCode(),
                            productName,
                            String.valueOf(item.getQuantity()),
                            formatCurrency(item.getUnitPrice()),
                            formatCurrency(lineTotal),
                            fontTableCellBold,
                            fontTableCell,
                            rowBg,
                            borderLight);
                }
            } else {
                PdfPCell emptyCell = new PdfPCell(new Phrase("אין פריטים להצגה בהזמנה זו", fontTableCell));
                emptyCell.setColspan(5);
                emptyCell.setHorizontalAlignment(Element.ALIGN_CENTER);
                emptyCell.setPadding(8);
                itemsTable.addCell(emptyCell);
            }

            document.add(itemsTable);
            document.add(new Paragraph(" ", new Font(bfReg, 4)));

            // ==========================================
            // 5. TOTALS & NOTES: 2 Columns RTL
            // ==========================================
            BigDecimal discount = order.getDiscountAmount() != null ? order.getDiscountAmount() : BigDecimal.ZERO;
            BigDecimal grandTotal = order.getTotalAmount() != null ? order.getTotalAmount() : subtotal.subtract(discount);
            BigDecimal netBeforeVat = grandTotal.divide(BigDecimal.ONE.add(VAT_RATE), 2, RoundingMode.HALF_UP);
            BigDecimal vatAmount = grandTotal.subtract(netBeforeVat);

            PdfPTable sumContainer = new PdfPTable(2);
            sumContainer.setWidthPercentage(100);
            sumContainer.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            // Physical LTR order: [Left=Totals, Right=Notes]
            sumContainer.setWidths(new float[]{1.0f, 1.1f});

            // Right Cell: Notes
            PdfPCell cNotes = new PdfPCell();
            cNotes.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            cNotes.setBorder(Rectangle.NO_BORDER);
            cNotes.setPaddingRight(6);

            Paragraph hn = new Paragraph("הערות ופרטי תשלום:", fontSectionHeader);
            hn.setAlignment(Element.ALIGN_LEFT);
            cNotes.addElement(hn);
            cNotes.addElement(new Paragraph(" ", new Font(bfReg, 2)));

            addNoteLine(cNotes, "התשלום התקבל בהצלחה באמצעות סליקת שב\"א / אשראי מאובטחת.", fontCompanySub);
            addNoteLine(cNotes, "חשבונית מס זו מהווה קבלה כדין לעניין חוק מס ערך מוסף.", fontCompanySub);
            addNoteLine(cNotes, "אספקת המוצרים תבוצע ע\"י חברת ההפצה בהתאם לתנאי המשלוח שנבחרו.", fontCompanySub);
            sumContainer.addCell(cNotes);

            // Left Cell: Financial Totals Box
            PdfPCell cSumBox = new PdfPCell();
            cSumBox.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            cSumBox.setBackgroundColor(zebraLight);
            cSumBox.setBorderColor(borderLight);
            cSumBox.setPadding(6);

            PdfPTable st = new PdfPTable(2);
            st.setWidthPercentage(100);
            st.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            // Physical LTR order: [Left=Value, Right=Label]
            st.setWidths(new float[]{0.9f, 1.4f});

            addSumRow(st, "סך ביניים (לפני מע\"מ והנחה):", formatCurrency(subtotal), fontLabel, fontValue);

            if (discount.compareTo(BigDecimal.ZERO) > 0) {
                String couponName = order.getCouponCode() != null ? "קופון (" + order.getCouponCode() + ")" : "הנחת מבצע";
                addSumRow(st, "הנחת " + couponName + ":", "- " + formatCurrency(discount), fontLabel, new Font(bfBold, 8.5f, Font.NORMAL, new Color(220, 38, 38)));
            }

            addSumRow(st, "סכום חייב במע\"מ (בסיס מס):", formatCurrency(netBeforeVat), fontLabel, fontValue);
            addSumRow(st, "מע\"מ בשיעור 18% (ישראל):", formatCurrency(vatAmount), fontLabel, fontValue);

            // Grand Total Highlight Row
            PdfPCell cgl = new PdfPCell();
            cgl.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            cgl.setBackgroundColor(totalBg);
            cgl.setBorderColor(totalBorder);
            cgl.setPadding(5);
            Paragraph pgl = new Paragraph("סה\"כ לתשלום כולל מע\"מ:", fontTotalLabel);
            pgl.setAlignment(Element.ALIGN_LEFT);
            cgl.addElement(pgl);

            PdfPCell cgv = new PdfPCell();
            cgv.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            cgv.setBackgroundColor(totalBg);
            cgv.setBorderColor(totalBorder);
            cgv.setPadding(5);
            Paragraph pgv = new Paragraph(formatCurrency(grandTotal), fontTotalValue);
            pgv.setAlignment(Element.ALIGN_RIGHT);
            cgv.addElement(pgv);

            st.addCell(cgl);
            st.addCell(cgv);

            cSumBox.addElement(st);
            sumContainer.addCell(cSumBox);

            document.add(sumContainer);

            // ==========================================
            // 6. FOOTER
            // ==========================================
            document.add(new Paragraph(" ", new Font(bfReg, 6)));
            document.add(createDivider(borderLight));

            PdfPTable foot = new PdfPTable(1);
            foot.setWidthPercentage(100);
            foot.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            PdfPCell cFoot = new PdfPCell();
            cFoot.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
            cFoot.setBorder(Rectangle.NO_BORDER);

            Paragraph f1 = new Paragraph("מסמך ממוחשב זה הופק ונחתם אלקטרונית בהתאם להוראות פקודת מס הכנסה (ניהול פנקסי חשבונות), התשל\"ג-1973.", fontFooter);
            f1.setAlignment(Element.ALIGN_CENTER);
            Paragraph f2 = new Paragraph("תודה שקניתם אצלנו! אנו מאחלים לכם חווית שימוש מהנה במוצריכם החדשים.", fontFooter);
            f2.setAlignment(Element.ALIGN_CENTER);

            cFoot.addElement(f1);
            cFoot.addElement(f2);
            foot.addCell(cFoot);
            document.add(foot);

            document.close();
        } catch (DocumentException ex) {
            log.error("Error creating Hebrew PDF invoice", ex);
            throw new RuntimeException("Failed to generate Hebrew PDF invoice: " + ex.getMessage());
        }

        return baos.toByteArray();
    }

    private void addKv(PdfPTable t, String k, String v, Font kf, Font vf) {
        PdfPCell ck = new PdfPCell();
        ck.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        ck.setBorder(Rectangle.NO_BORDER);
        ck.setPadding(2);
        Paragraph pk = new Paragraph(k, kf);
        pk.setAlignment(Element.ALIGN_LEFT); // Physical Right
        ck.addElement(pk);

        PdfPCell cv = new PdfPCell();
        cv.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        cv.setBorder(Rectangle.NO_BORDER);
        cv.setPadding(2);
        Paragraph pv = new Paragraph(v, vf);
        pv.setAlignment(Element.ALIGN_LEFT); // Physical Right (adjacent to label)
        cv.addElement(pv);

        t.addCell(ck);
        t.addCell(cv);
    }

    private void addHead(PdfPTable t, String txt, Font f, Color bg, int align) {
        PdfPCell c = new PdfPCell();
        c.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        c.setBackgroundColor(bg);
        c.setBorderColor(bg);
        c.setPadding(5);
        Paragraph p = new Paragraph(txt, f);
        p.setAlignment(align);
        c.addElement(p);
        t.addCell(c);
    }

    private void addItem(PdfPTable t, String sku, String desc, String qty, String price, String total, Font fb, Font fr, Color bg, Color bdr) {
        t.addCell(cell(sku, fb, Element.ALIGN_CENTER, bg, bdr));
        t.addCell(cell(desc, fr, Element.ALIGN_LEFT, bg, bdr)); // Physical Right
        t.addCell(cell(qty, fb, Element.ALIGN_CENTER, bg, bdr));
        t.addCell(cell(price, fr, Element.ALIGN_RIGHT, bg, bdr)); // Physical Left
        t.addCell(cell(total, fb, Element.ALIGN_RIGHT, bg, bdr)); // Physical Left
    }

    private PdfPCell cell(String txt, Font f, int align, Color bg, Color bdr) {
        PdfPCell c = new PdfPCell();
        c.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        c.setBackgroundColor(bg);
        c.setBorderColor(bdr);
        c.setPadding(4.5f);
        Paragraph p = new Paragraph(txt, f);
        p.setAlignment(align);
        c.addElement(p);
        return c;
    }

    private void addNoteLine(PdfPCell container, String txt, Font f) {
        Paragraph p = new Paragraph("•  " + txt, f);
        p.setAlignment(Element.ALIGN_LEFT); // Physical Right
        p.setSpacingAfter(2f);
        container.addElement(p);
    }

    private void addSumRow(PdfPTable t, String l, String v, Font lf, Font vf) {
        PdfPCell cl = new PdfPCell();
        cl.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        cl.setBorder(Rectangle.NO_BORDER);
        cl.setPadding(2.5f);
        Paragraph pl = new Paragraph(l, lf);
        pl.setAlignment(Element.ALIGN_LEFT); // Physical Right
        cl.addElement(pl);

        PdfPCell cv = new PdfPCell();
        cv.setRunDirection(PdfWriter.RUN_DIRECTION_RTL);
        cv.setBorder(Rectangle.NO_BORDER);
        cv.setPadding(2.5f);
        Paragraph pv = new Paragraph(v, vf);
        pv.setAlignment(Element.ALIGN_RIGHT); // Physical Left
        cv.addElement(pv);

        t.addCell(cl);
        t.addCell(cv);
    }

    private PdfPTable createDivider(Color color) {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderColor(color);
        cell.setBorderWidth(1f);
        cell.setFixedHeight(5f);
        table.addCell(cell);
        return table;
    }

    private BaseFont loadBaseFont(String resourcePath, String fontName, boolean bold) {
        try {
            InputStream is = getClass().getResourceAsStream(resourcePath);
            if (is != null) {
                byte[] fontBytes = is.readAllBytes();
                return BaseFont.createFont(fontName, BaseFont.IDENTITY_H, BaseFont.EMBEDDED, true, fontBytes, null);
            }
        } catch (Exception e) {
            log.warn("Could not load embedded font {} from classpath: {}", resourcePath, e.getMessage());
        }

        // Fallback 1: Windows font directory
        try {
            String winPath = "C:\\Windows\\Fonts\\" + fontName;
            if (new java.io.File(winPath).exists()) {
                return BaseFont.createFont(winPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            }
        } catch (Exception ignored) {}

        // Fallback 2: Linux DejaVu font
        try {
            String linuxPath = bold ? "/usr/share/fonts/dejavu/DejaVuSans-Bold.ttf" : "/usr/share/fonts/dejavu/DejaVuSans.ttf";
            if (new java.io.File(linuxPath).exists()) {
                return BaseFont.createFont(linuxPath, BaseFont.IDENTITY_H, BaseFont.EMBEDDED);
            }
        } catch (Exception ignored) {}

        // Ultimate Fallback
        try {
            return BaseFont.createFont(BaseFont.HELVETICA, BaseFont.WINANSI, BaseFont.NOT_EMBEDDED);
        } catch (Exception e) {
            throw new RuntimeException("Could not initialize base font for PDF", e);
        }
    }

    private String formatCurrency(BigDecimal amount) {
        if (amount == null) return "0.00 ₪";
        return CURRENCY_FORMAT.format(amount) + " ₪";
    }

    private String getStatusHebrew(OrderStatus status) {
        if (status == null) return "לא ידוע";
        return switch (status) {
            case CONFIRMED -> "אושרה ושולמה בהצלחה";
            case CANCELLED -> "בוטלה וזוכתה (פיצוי SAGA)";
            case PENDING -> "ממתינה לאישור סופי";
            case PENDING_PAYMENT -> "ממתינה לעיבוד תשלום אסינכרוני";
            case FAILED -> "נכשלה";
        };
    }
}
