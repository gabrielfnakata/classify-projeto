package br.com.ifsp.classify.services;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.http.Method;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class FileStorageService {

    private final MinioClient minioClient;

    public FileStorageService(
            MinioClient minioClient
    ) {
        this.minioClient = minioClient;
    }

    public String generateUploadUrl(String bucket, String uuid) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.PUT)
                        .bucket(bucket)
                        .object(uuid)
                        .expiry(10, TimeUnit.MINUTES)
                        .build()
        );
    }

    public String generateDownloadUrl(String bucket, String uuid) throws Exception {
        return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucket)
                        .object(uuid)
                        .expiry(10, TimeUnit.MINUTES)
                        .build()
        );
    }

}
