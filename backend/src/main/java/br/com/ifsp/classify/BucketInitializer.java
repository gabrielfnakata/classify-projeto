package br.com.ifsp.classify;

import java.security.InvalidKeyException;
import java.security.NoSuchAlgorithmException;
import java.io.IOException;
import io.minio.BucketExistsArgs;
import io.minio.MakeBucketArgs;
import io.minio.MinioClient;
import io.minio.errors.MinioException;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.util.List;
import java.util.logging.Logger;

@Configuration
public class BucketInitializer {

    private static final Logger logger = Logger.getLogger(BucketInitializer.class.getName());

    private final String s3Endpoint;
    private final String s3AccessKey;
    private final String s3SecretKey;
    private final List<String> buckets;

    public BucketInitializer(
            @Value("${minio.s3.url}") String s3Endpoint,
            @Value("${minio.s3.access-key}") String s3AccessKey,
            @Value("${minio.s3.secret-key}") String s3SecretKey,
            @Value("${minio.initializer.buckets}") List<String> buckets
    ) {
        this.s3Endpoint = s3Endpoint;
        this.s3AccessKey = s3AccessKey;
        this.s3SecretKey = s3SecretKey;
        this.buckets = buckets;
    }

    @PostConstruct
    public void initializeBuckets() {
        MinioClient client =
                MinioClient.builder()
                        .endpoint(s3Endpoint)
                        .credentials(s3AccessKey, s3SecretKey)
                        .build();

        buckets.forEach(bucket -> {
            try {
                boolean exists = client.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
                if (!exists) {
                    client.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                    logger.info("Bucket " + bucket + " created");
                }
            } catch (MinioException | InvalidKeyException | NoSuchAlgorithmException | IOException e) {
                logger.info(e.getMessage());
            }
        });
    }
}
