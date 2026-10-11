package com.studyhub.serviceImpl;

import com.studyhub.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Service
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final String fromEmail;
    private final String frontendUrl;

    public EmailServiceImpl(@Value("${spring.mail.username}") String fromEmail,
                            @Value("${frontend.url:http://localhost:5173}") String frontendUrl) {
        this.fromEmail = fromEmail;
        this.frontendUrl = frontendUrl;
        this.mailSender = createMailSender();
    }

    private JavaMailSender createMailSender() {
        JavaMailSenderImpl mailSender = new JavaMailSenderImpl();
        mailSender.setHost("smtp.gmail.com");
        mailSender.setPort(587);
        
        // ✅ PUT YOUR EMAIL HERE
        mailSender.setUsername("pranithamavuri379@gmail.com");
        
        // ✅ PUT YOUR 16-DIGIT APP PASSWORD HERE (NOT your regular password)
        mailSender.setPassword("seyo xwse enns hmga"); // Replace with your actual app password
        
        Properties props = mailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.starttls.required", "true");
        props.put("mail.smtp.ssl.trust", "smtp.gmail.com");
        props.put("mail.smtp.ssl.protocols", "TLSv1.2");
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        props.put("mail.debug", "true");

        return mailSender;
    }

    @Override
    @Async
    public void sendVerificationEmail(String to, String code, String name) {
        System.out.println("=========================================");
        System.out.println("📧 VERIFICATION CODE FOR: " + to);
        System.out.println("🔐 YOUR OTP: " + code);
        System.out.println("⏰ Expires in: 5 minutes");
        System.out.println("=========================================");

        try {
            String subject = "🔐 StudyHub - Email Verification Code";
            String body = "Hello " + name + ",\n\n" +
                    "Thank you for registering with StudyHub!\n\n" +
                    "Your verification code is: " + code + "\n\n" +
                    "This code will expire in 5 minutes.\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
            System.out.println("✅ Verification email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Email send failed: " + e.getMessage());
            System.out.println("📱 Use OTP from console: " + code);
        }
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String resetToken) {
        try {
            String resetUrl = frontendUrl + "/reset-password?token=" + resetToken;
            String subject = "🔐 StudyHub - Password Reset";
            String body = "Hello,\n\n" +
                    "Click the link to reset your password:\n" +
                    resetUrl + "\n\n" +
                    "This link will expire in 1 hour.\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
            System.out.println("✅ Password reset email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Password reset email failed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendWelcomeEmail(String to, String name) {
        try {
            String subject = "🎉 Welcome to StudyHub!";
            String body = "Hello " + name + ",\n\n" +
                    "Welcome to StudyHub!\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
            System.out.println("✅ Welcome email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Welcome email failed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendMaterialUploadConfirmation(String to, String materialTitle) {
        try {
            String subject = "📄 Material Uploaded Successfully";
            String body = "Hello,\n\n" +
                    "Your material \"" + materialTitle + "\" has been uploaded successfully to StudyHub.\n\n" +
                    "Students can now access and download this material.\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
            System.out.println("✅ Material upload email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Material upload email failed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendTeacherApprovalEmail(String to, String name) {
        try {
            String subject = "✅ StudyHub - Teacher Account Approved";
            String body = "Dear " + name + ",\n\n" +
                    "Your teacher account has been approved by the admin.\n\n" +
                    "You can now login at: " + frontendUrl + "\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
            System.out.println("✅ Teacher approval email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Teacher approval email failed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendTeacherRejectionEmail(String to, String name, String reason) {
        try {
            String subject = "❌ StudyHub - Teacher Account Rejected";
            String body = "Dear " + name + ",\n\n" +
                    "Your teacher account request has been rejected.\n\n" +
                    "Reason: " + (reason != null ? reason : "Not specified") + "\n\n" +
                    "If you have any questions, please contact the admin.\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
            System.out.println("✅ Teacher rejection email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Teacher rejection email failed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendAccountApprovalEmail(String to, String name, String role) {
        try {
            String roleDisplay = role != null ? role.replace("ROLE_", "") : "User";
            String subject = "✅ StudyHub - " + roleDisplay + " Account Approved";
            String body = "Dear " + name + ",\n\n" +
                    "Your " + roleDisplay + " account has been approved by the admin.\n\n" +
                    "You can now login at: " + frontendUrl + "\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
            System.out.println("✅ Account approval email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Account approval email failed: " + e.getMessage());
        }
    }

    @Override
    @Async
    public void sendAccountRejectionEmail(String to, String name, String reason) {
        try {
            String subject = "❌ StudyHub - Account Rejected";
            String body = "Dear " + name + ",\n\n" +
                    "Your account request has been rejected.\n\n" +
                    "Reason: " + (reason != null ? reason : "Not specified") + "\n\n" +
                    "If you have any questions, please contact the admin.\n\n" +
                    "Best regards,\nStudyHub Team";
            sendEmail(to, subject, body);
            System.out.println("✅ Account rejection email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Account rejection email failed: " + e.getMessage());
        }
    }

    @Override
    public void sendEmail(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
            System.out.println("✅ Email sent to: " + to);
        } catch (Exception e) {
            System.err.println("❌ Failed to send email to " + to + ": " + e.getMessage());
            throw new RuntimeException("Email send failed", e);
        }
    }
}