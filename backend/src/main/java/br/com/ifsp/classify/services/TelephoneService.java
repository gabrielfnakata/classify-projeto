package br.com.ifsp.classify.services;

import org.springframework.stereotype.Service;

import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;
import br.com.ifsp.classify.dtos.get.TelephoneGetDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Telephone;
import br.com.ifsp.classify.utils.Utils;

@Service
public class TelephoneService {

    public TelephoneGetDTO returnDTO(Telephone telephone) {
        if (telephone == null)
            return null;

        return new TelephoneGetDTO(
            telephone.getCountry(),
            telephone.getDdd(),
            telephone.getNumber()
        );
    }

    public Telephone create(TelephoneCreateDTO telephoneDTO) {
        if (telephoneDTO == null)
            return null;
        
        if (!Utils.isNullOrEmpty(telephoneDTO.country()) && 
            (telephoneDTO.country().trim().matches("\\D") || telephoneDTO.country().trim().length() > 3))
            throw new DtoException("Foi informado um código de país inválido");
        
        if (!Utils.isNullOrEmpty(telephoneDTO.ddd()) && 
            (telephoneDTO.ddd().trim().matches("\\D") || telephoneDTO.ddd().trim().length() > 5))
            throw new DtoException("Foi informado um DDD inválido");

        if (Utils.isNullOrEmpty(telephoneDTO.number()))
            throw new DtoException("É necessário informar um número");
        else if (telephoneDTO.number().trim().matches("\\D") || telephoneDTO.number().trim().length() != 11)
            throw new DtoException("Foi informado um número inválido");

        Telephone newTelephone = new Telephone();
        newTelephone.setCountry(Utils.trimAndUpper(telephoneDTO.country().trim()));
        newTelephone.setDdd(Utils.trimAndUpper(telephoneDTO.ddd().trim()));
        newTelephone.setNumber(Utils.trimAndUpper(telephoneDTO.number().trim()));

        return newTelephone;
    }

    // public Telephone validateTelephoneUpdate(TelephoneUpdateDTO telephoneDTO, Guardian guardian) {
    //     if (telephoneDTO == null)
    //         return null;

    //     Telephone updatedTelephone = guardianRepository.(null);

    //     if (!Utils.isNullOrEmpty(telephoneDTO.country())) {
    //         if (telephoneDTO.country().trim().matches("\\D") || telephoneDTO.country().trim().length() > 3)
    //             throw new DtoException("Foi informado um código de país inválido");

    //         updatedTelephone.setCountry(telephoneDTO.country().trim());
    //     }

    //     if (!Utils.isNullOrEmpty(telephoneDTO.ddd())) {
    //         if (telephoneDTO.ddd().trim().matches("\\D") || telephoneDTO.ddd().trim().length() > 5)
    //             throw new DtoException("Foi informado um DDD inválido");

    //         updatedTelephone.setDdd(telephoneDTO.ddd().trim());
    //     }

    //     if (!Utils.isNullOrEmpty(telephoneDTO.number())) {
    //         if (telephoneDTO.number().trim().matches("\\D") || telephoneDTO.number().trim().length() != 11)
    //             throw new DtoException("Foi informado um número inválido");

    //         updatedTelephone.setNumber(telephoneDTO.number().trim());
    //     }

    //     return updatedTelephone;
    // }
}
