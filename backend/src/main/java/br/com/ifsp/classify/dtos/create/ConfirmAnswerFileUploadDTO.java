package br.com.ifsp.classify.dtos.create;

import java.util.List;

public record ConfirmAnswerFileUploadDTO(
        List<Record> records
) {
        public record Record(S3Data s3) {}
        public record S3Data(BucketData bucket, ObjectData object) {}
        public record BucketData(String name) {}
        public record ObjectData(String key, long size) {}
}
