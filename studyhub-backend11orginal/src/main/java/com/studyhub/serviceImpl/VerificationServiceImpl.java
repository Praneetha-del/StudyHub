package com.studyhub.serviceImpl;

import com.studyhub.entity.User;
import com.studyhub.entity.VerificationCode;
import com.studyhub.exception.InvalidTokenException;
import com.studyhub.exception.ResourceNotFoundException;
import com.studyhub.repository.UserRepository;
import com.studyhub.repository.VerificationCodeRepository;
import com.studyhub.service.EmailService;
import com.studyhub.service.VerificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class VerificationServiceImpl implements VerificationService {

    @Autowired
    private VerificationCodeRepository verificationCodeRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private final SecureRandom random = new SecureRandom();

    @Override
    @Transactional
    public void sendVerificationCode(String email) {
        // Delete existing codes
        verificationCodeRepository.deleteByEmail(email);

        // Generate new code
        String code = String.format("%06d", random.nextInt(1000000));
        System.out.println("📧 Verification code for " + email + ": " + code);

        // Save verification code
        VerificationCode verificationCode = new VerificationCode();
        verificationCode.setEmail(email);
        verificationCode.setCode(code);
        verificationCode.setVerified(false);
        verificationCode.setExpiryDate(LocalDateTime.now().plusMinutes(5));
        verificationCode.setCreatedAt(LocalDateTime.now());

        verificationCodeRepository.save(verificationCode);

        // Send email
        try {
            emailService.sendVerificationEmail(email, code, "User");
            System.out.println("✅ Verification email sent to: " + email);
        } catch (Exception e) {
            System.err.println("❌ Failed to send verification email: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public boolean verifyCode(String email, String code) {
        System.out.println("🔐 Verifying code for: " + email + ", Code: " + code);

        VerificationCode verificationCode = verificationCodeRepository
                .findByEmailAndCodeAndVerifiedFalse(email, code)
                .orElse(null);

        if (verificationCode == null) {
            System.out.println("❌ No valid verification code found for: " + email);
            throw new InvalidTokenException("Invalid or expired verification code");
        }

        // Check if expired
        if (verificationCode.getExpiryDate().isBefore(LocalDateTime.now())) {
            System.out.println("❌ Code expired at: " + verificationCode.getExpiryDate());
            throw new InvalidTokenException("Verification code has expired");
        }

        // Mark as verified
        verificationCode.setVerified(true);
        verificationCodeRepository.save(verificationCode);

        System.out.println("✅ Code verified successfully for: " + email);

        // Update user status if exists
        User user = userRepository.findByEmail(email).orElse(null);
        if (user != null && "PENDING_OTP".equals(user.getStatus())) {
            user.setStatus("PENDING");
            user.setActive(true);
            userRepository.save(user);
            System.out.println("✅ User status updated to PENDING: " + email);
        }

        return true;
    }

    @Override
    public void resendVerificationCode(String email) {
        sendVerificationCode(email);
    }

    @Override
    @Transactional
    public void verifyAndRegister(VerificationCode verificationCode) {
        if (verificationCode.isVerified()) {
            throw new InvalidTokenException("Code already used");
        }

        if (verificationCode.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Code expired");
        }

        verificationCode.setVerified(true);
        verificationCodeRepository.save(verificationCode);

        // Check if user exists
        User existingUser = userRepository.findByEmail(verificationCode.getEmail()).orElse(null);
        if (existingUser != null) {
            // If user already exists, just update their status
            existingUser.setStatus("PENDING");
            existingUser.setActive(true);
            userRepository.save(existingUser);
            return;
        }

        // Create new user
        User user = new User();
        user.setFirstName(verificationCode.getFirstName());
        user.setLastName(verificationCode.getLastName());
        user.setEmail(verificationCode.getEmail());
        user.setPassword(passwordEncoder.encode(verificationCode.getPassword()));
        user.setRole(verificationCode.getRole());
        user.setDepartment(verificationCode.getDepartment());
        user.setRollNumber(verificationCode.getRollNumber());
        user.setEmployeeId(verificationCode.getEmployeeId());
        user.setBranch(verificationCode.getBranch());
        user.setYear(verificationCode.getYear());
        user.setSemester(verificationCode.getSemester());
        user.setJoiningYear(verificationCode.getJoiningYear());
        user.setStatus("PENDING");
        user.setActive(true);

        userRepository.save(user);
        System.out.println("✅ User registered successfully: " + verificationCode.getEmail());
    }

    @Override
    public void cleanupExpiredCodes() {
        verificationCodeRepository.deleteByExpiryDateBefore(LocalDateTime.now());
        System.out.println("🧹 Cleaned up expired verification codes");
    }

    @Override
    public void deleteVerificationCode(String email) {
        verificationCodeRepository.deleteByEmail(email);
        System.out.println("🗑️ Deleted verification codes for: " + email);
    }

    @Override
    public VerificationCode getValidCode(String email, String code) {
        return verificationCodeRepository
                .findValidCode(email, code, LocalDateTime.now())
                .orElseThrow(() -> new InvalidTokenException("Invalid or expired verification code"));
    }

    @Override
    public List<VerificationCode> getPendingCodes(String email) {
        // ✅ FIXED: Use findAllByEmailAndVerifiedFalse
        return verificationCodeRepository.findAllByEmailAndVerifiedFalse(email);
    }

    @Override
    public boolean hasValidCode(String email) {
        // ✅ FIXED: Use findAllByEmailAndVerifiedFalse
        return verificationCodeRepository.findAllByEmailAndVerifiedFalse(email).stream()
                .anyMatch(code -> code.getExpiryDate().isAfter(LocalDateTime.now()));
    }

    @Override
    public VerificationCode getLatestCode(String email) {
        // ✅ FIXED: Use findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc
        return verificationCodeRepository
                .findFirstByEmailAndVerifiedFalseOrderByCreatedAtDesc(email)
                .orElseThrow(() -> new ResourceNotFoundException("No verification code found for: " + email));
    }
}