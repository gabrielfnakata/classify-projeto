package br.com.ifsp.classify.services;

import org.springframework.stereotype.Service;

import br.com.ifsp.classify.dtos.get.ClassGetDTO;
import br.com.ifsp.classify.models.Class;
import br.com.ifsp.classify.utils.UuidUtils;

@Service
public class ClassService {

    public ClassGetDTO returnDTO(Class classModel) {
        if (classModel == null)
            return null;

        return new ClassGetDTO(
            UuidUtils.convertBytesToString(classModel.getUuid()),
            classModel.getName(),
            classModel.getDescription()
        );
    }
}