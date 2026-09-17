package br.com.ifsp.classify.dtos;

import java.util.List;

public record AttendanceBulkSaveDTO(
        List<AttendanceRecordInputDTO> records
) {}
