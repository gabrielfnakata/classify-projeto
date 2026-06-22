package br.com.ifsp.classify.services;

import org.springframework.stereotype.Service;

import br.com.ifsp.classify.dtos.get.ReportGetDTO;
import br.com.ifsp.classify.models.Report;

@Service
public class ReportService {

    public ReportGetDTO returnDTO(Report report) {
        if (report == null)
            return null;

        return new ReportGetDTO(
            report.getContent()
        );
    }
}