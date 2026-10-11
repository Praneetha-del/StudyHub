package com.studyhub.service;

import com.studyhub.dto.request.MaterialRequest;
import com.studyhub.dto.response.MaterialResponse;
import org.springframework.web.multipart.MultipartFile;
import java.util.List;

public interface MaterialService {

    MaterialResponse uploadMaterial(MaterialRequest request, MultipartFile file, String userId, String userEmail, String userName);

    MaterialResponse uploadYouTubeMaterial(MaterialRequest request, String userId, String userEmail, String userName);

    List<MaterialResponse> getAllMaterials();

    MaterialResponse getMaterialById(String id);

    MaterialResponse updateMaterial(String id, MaterialRequest request, MultipartFile file, String userId);

    void deleteMaterial(String id, String userId, String userRole);

    List<MaterialResponse> getMaterialsByTeacher(String userId);

    List<MaterialResponse> getMaterialsByCurriculum(String departmentId, String regulationId, Integer joiningYear, Integer academicYear, Integer semester);

    MaterialResponse blockMaterial(String id, String adminId, String adminNotes);

    MaterialResponse unblockMaterial(String id);

    List<MaterialResponse> searchMaterials(String query, String departmentId, String subjectId, Integer semester);

    void validateMaterialBelongsToCurriculum(MaterialRequest request);
}