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

    private final MinioClient minioClient;
    private final List<String> buckets;

    public BucketInitializer(
            MinioClient minioClient,
            @Value("${minio.initializer.buckets}") List<String> buckets
    ) {
        this.minioClient = minioClient;
        this.buckets = buckets;
    }

    @PostConstruct
    public void initializeBuckets() {
        buckets.forEach(bucket -> {
            try {
                boolean exists = minioClient.bucketExists(BucketExistsArgs.builder().bucket(bucket).build());
                if (!exists) {
                    minioClient.makeBucket(MakeBucketArgs.builder().bucket(bucket).build());
                    logger.info("Bucket " + bucket + " created");
                }
            } catch (MinioException | InvalidKeyException | NoSuchAlgorithmException | IOException e) {
                logger.info(e.getMessage());
            }
        });
    }
}
