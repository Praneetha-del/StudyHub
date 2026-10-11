package com.studyhub.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String uploadFile(MultipartFile file, String folder);
    String uploadFile(byte[] fileData, String fileName, String folder);
    void deleteFile(String publicId);
    String getPublicIdFromUrl(String url);
    boolean isFileValid(MultipartFile file);
}