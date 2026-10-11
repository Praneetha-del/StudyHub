package com.studyhub.serviceImpl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.studyhub.exception.InvalidFileException;
import com.studyhub.exception.StorageException;
import com.studyhub.service.FileStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class FileStorageServiceImpl implements FileStorageService {

    @Autowired
    private Cloudinary cloudinary;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024;
    private static final String[] ALLOWED_TYPES = {"pdf", "ppt", "pptx", "doc", "docx"};

    @Override
    public String uploadFile(MultipartFile file, String folder) {

        if (file == null || file.isEmpty()) {
            throw new InvalidFileException("File is empty");
        }

        if (!isFileValid(file)) {
            throw new InvalidFileException("Invalid file type or size exceeded");
        }

        try {
            // ✅ Get file extension
            String fileName = file.getOriginalFilename();
            String extension = getFileExtension(fileName).toLowerCase();

            // ✅ PDF = image, others = raw
            String resourceType;
            if ("pdf".equals(extension)) {
                resourceType = "image";
            } else {
                resourceType = "raw";
            }

            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", resourceType,
                    "use_filename", true,
                    "unique_filename", true,
                    "overwrite", false
            );

            Map<String, Object> uploadResult = cloudinary.uploader().upload(file.getBytes(), uploadParams);

            System.out.println("=== CLOUDINARY UPLOAD SUCCESS ===");
            System.out.println("File Name: " + file.getOriginalFilename());
            System.out.println("Resource Type: " + uploadResult.get("resource_type"));
            System.out.println("Public ID: " + uploadResult.get("public_id"));
            System.out.println("Secure URL: " + uploadResult.get("secure_url"));
            System.out.println("====================================");

            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new StorageException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Override
    public String uploadFile(byte[] fileData, String fileName, String folder) {

        try {
            // ✅ Get file extension
            String extension = getFileExtension(fileName).toLowerCase();

            // ✅ PDF = image, others = raw
            String resourceType;
            if ("pdf".equals(extension)) {
                resourceType = "image";
            } else {
                resourceType = "raw";
            }

            Map<String, Object> uploadParams = ObjectUtils.asMap(
                    "folder", folder,
                    "resource_type", resourceType,
                    "use_filename", true,
                    "unique_filename", true,
                    "overwrite", false
            );

            Map<String, Object> uploadResult = cloudinary.uploader().upload(fileData, uploadParams);

            System.out.println("=== CLOUDINARY BYTE UPLOAD SUCCESS ===");
            System.out.println("File Name: " + fileName);
            System.out.println("Resource Type: " + uploadResult.get("resource_type"));
            System.out.println("Public ID: " + uploadResult.get("public_id"));
            System.out.println("Secure URL: " + uploadResult.get("secure_url"));
            System.out.println("========================================");

            return uploadResult.get("secure_url").toString();

        } catch (IOException e) {
            throw new StorageException("Failed to upload file: " + e.getMessage(), e);
        }
    }

    @Override
    public void deleteFile(String publicId) {
        try {
            if (publicId != null && !publicId.isEmpty()) {
                // ✅ Try both resource types
                try {
                    cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "image"));
                } catch (Exception e) {
                    // If image fails, try raw
                    cloudinary.uploader().destroy(publicId, ObjectUtils.asMap("resource_type", "raw"));
                }
            }
        } catch (Exception e) {
            throw new StorageException("Failed to delete file: " + e.getMessage(), e);
        }
    }

    @Override
    public String getPublicIdFromUrl(String url) {
        if (url == null || url.isEmpty()) {
            return null;
        }

        try {
            String[] parts = url.split("/upload/");
            if (parts.length < 2) {
                return null;
            }

            String publicPart = parts[1];

            // Remove version if present (v123456789)
            if (publicPart.startsWith("v")) {
                int slashIndex = publicPart.indexOf("/");
                if (slashIndex != -1) {
                    publicPart = publicPart.substring(slashIndex + 1);
                }
            }

            // Remove file extension
            int dotIndex = publicPart.lastIndexOf(".");
            if (dotIndex != -1) {
                publicPart = publicPart.substring(0, dotIndex);
            }

            return publicPart;
        } catch (Exception e) {
            return null;
        }
    }

    @Override
    public boolean isFileValid(MultipartFile file) {
        if (file.getSize() > MAX_FILE_SIZE) {
            return false;
        }

        String fileName = file.getOriginalFilename();
        if (fileName == null) {
            return false;
        }

        String extension = getFileExtension(fileName).toLowerCase();
        for (String allowed : ALLOWED_TYPES) {
            if (allowed.equals(extension)) {
                return true;
            }
        }
        return false;
    }

    private String getFileExtension(String fileName) {
        if (fileName == null) return "";
        int lastDotIndex = fileName.lastIndexOf(".");
        if (lastDotIndex == -1) return "";
        return fileName.substring(lastDotIndex + 1);
    }
}