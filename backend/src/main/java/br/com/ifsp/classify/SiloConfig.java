package br.com.ifsp.classify;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import io.minio.MinioClient;


@Configuration
public class SiloConfig {
    @Bean
    public MinioClient minioClient(
            @Value("${minio.s3.url}") String s3Endpoint,
            @Value("${minio.s3.access-key}") String s3AccessKey,
            @Value("${minio.s3.secret-key}") String s3SecretKey
    ) {
        return MinioClient.builder()
                .endpoint(s3Endpoint)
                .credentials(s3AccessKey, s3SecretKey)
                .build();
    }
}
