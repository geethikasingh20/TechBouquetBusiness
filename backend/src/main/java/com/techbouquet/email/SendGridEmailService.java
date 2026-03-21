package com.techbouquet.email;

import com.sendgrid.Method;
import com.sendgrid.Request;
import com.sendgrid.Response;
import com.sendgrid.SendGrid;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import java.io.IOException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SendGridEmailService {
    private static final Logger log = LoggerFactory.getLogger(SendGridEmailService.class);

    @Value("${app.email.sendgrid.apiKey:}")
    private String apiKey;

    @Value("${app.email.sendgrid.fromEmail:}")
    private String fromEmail;

    @Value("${app.email.sendgrid.fromName:Velvet Petals}")
    private String fromName;

    @Value("${app.email.assets.logoUrl:}")
    private String logoUrl;

    @Value("${app.email.assets.backgroundUrl:}")
    private String backgroundUrl;

    public void sendWelcomeEmail(String toEmail, String name, String verifyLink) {
        if (apiKey == null || apiKey.isBlank()) {
             log.info("==== apiKey"+apiKey);
            log.warn("SendGrid API key not configured. Skipping welcome email.");
            return;
        }
         log.info("==== debug point 1 ");
        if (fromEmail == null || fromEmail.isBlank()) {
             log.info("==== debug point 2 ");
            log.warn("SendGrid fromEmail not configured. Skipping welcome email.");
            return;
        }
         log.info("==== debug point 3 ");
        String safeName = (name == null || name.isBlank()) ? "there" : name;
        String subject = "Welcome to Velvet Petals";

        String logoBlock = (logoUrl == null || logoUrl.isBlank()) ? "" :
                "<div style=\"text-align:center;margin-bottom:16px;\">"
                        + "<img src=\"" + logoUrl + "\" alt=\"Velvet Petals\" style=\"max-width:180px;height:auto;\"/>"
                        + "</div>";

        String backgroundStyle = (backgroundUrl == null || backgroundUrl.isBlank())
                ? ""
                : "background-image:url('" + backgroundUrl + "');background-size:cover;background-position:center;";

        String verifyBlock = (verifyLink == null || verifyLink.isBlank()) ? "" :
                "<div style=\"margin-top:20px;text-align:center;\">"
                        + "<a href=\"" + verifyLink + "\" style=\"display:inline-block;padding:12px 20px;background:#f15f3f;color:#ffffff;text-decoration:none;border-radius:8px;font-weight:600;\">Verify Email</a>"
                        + "</div>";

        String html = "<div style=\"font-family: Arial, sans-serif; line-height: 1.5; padding: 24px; " + backgroundStyle + "\">"
                + "<div style=\"background:transparent;padding:24px;border-radius:16px;\">"
                + logoBlock
                + "<h2>Welcome, " + safeName + "!</h2>"
                + "<p>Thank you for joining Velvet Petals. We are excited to help you send beautiful flowers, plants, and gifts.</p>"
                + "<p>If you need help, reply to this email anytime.</p>"
                + verifyBlock
                + "<p style=\"margin-top:18px;\">Warmly,<br/>Velvet Petals Team</p>"
                + "</div>"
                + "</div>";

        Email from = new Email(fromEmail, fromName);
        Email to = new Email(toEmail);
        Content content = new Content("text/html", html);
        Mail mail = new Mail(from, subject, to, content);
        log.info("==== debug point 3 ");
        SendGrid sg = new SendGrid(apiKey);
        Request request = new Request();
         log.info("==== debug point 4"+ apiKey+ fromEmail+ to+content+mail+sg);
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
             log.info("==== debug point request"+ request);
            Response response = sg.api(request);
             log.info("==== debug point 5 ");
            int status = response.getStatusCode();
             log.info("==== debug point 6 "+status);
            if (status >= 200 && status < 300) {
                log.info("Welcome email sent to {}", toEmail);
            } else {
                log.warn("SendGrid responded with status={} body={}", status, response.getBody());
            }
        } catch (IOException ex) {
            log.warn("Failed to send welcome email to {}", toEmail, ex);
        }
    }
}
