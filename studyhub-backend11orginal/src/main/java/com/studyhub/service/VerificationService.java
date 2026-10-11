package com.studyhub.service;

import com.studyhub.entity.VerificationCode;
import java.util.List;

public interface VerificationService {

    void sendVerificationCode(String email);

    boolean verifyCode(String email, String code);

    void resendVerificationCode(String email);

    void verifyAndRegister(VerificationCode verificationCode);

    void cleanupExpiredCodes();

    void deleteVerificationCode(String email);

    VerificationCode getValidCode(String email, String code);

    List<VerificationCode> getPendingCodes(String email);

    boolean hasValidCode(String email);

    VerificationCode getLatestCode(String email);
}