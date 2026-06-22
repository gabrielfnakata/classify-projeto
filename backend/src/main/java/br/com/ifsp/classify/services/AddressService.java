package br.com.ifsp.classify.services;

import org.springframework.stereotype.Service;

import br.com.ifsp.classify.dtos.create.AddressCreateDTO;
import br.com.ifsp.classify.dtos.get.AddressGetDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Address;
import br.com.ifsp.classify.utils.Utils;

@Service
public class AddressService {

    public AddressGetDTO returnDTO(Address address) {
        if (address == null)
            return null;

        return new AddressGetDTO(
            address.getZipCode(),
            address.getStreet(),
            address.getNumber(),
            address.getComplement(),
            address.getNeighborhood(),
            address.getCity(),
            address.getState()
        );
    }

    public Address create(AddressCreateDTO addressDTO) {
        if (addressDTO == null)
            return null;

        if (Utils.isNullOrEmpty(addressDTO.zipCode()))
            throw new DtoException("É necessário informar um CEP");

        if (Utils.isNullOrEmpty(addressDTO.street()))
            throw new DtoException("É necessário informar uma rua");

        if (Utils.isNullOrEmpty(addressDTO.number()))
            throw new DtoException("É necessário informar um número");

        if (Utils.isNullOrEmpty(addressDTO.neighborhood()))
            throw new DtoException("É necessário informar um bairro");

        if (Utils.isNullOrEmpty(addressDTO.city()))
            throw new DtoException("É necessário informar uma cidade");

        if (Utils.isNullOrEmpty(addressDTO.state()))
            throw new DtoException("É necessário informar um estado");

        // TODO: Fazer a validação correta dos endereços
        Address newAddress = new Address();
        newAddress.setZipCode(addressDTO.zipCode());
        newAddress.setStreet(Utils.trimAndUpper(addressDTO.street()));
        newAddress.setNumber(Utils.trimAndUpper(addressDTO.number()));
        newAddress.setComplement(Utils.trimAndUpper(addressDTO.complement()));
        newAddress.setNeighborhood(Utils.trimAndUpper(addressDTO.neighborhood()));
        newAddress.setCity(Utils.trimAndUpper(addressDTO.city()));
        newAddress.setState(Utils.trimAndUpper(addressDTO.state()));

        return newAddress;
    }
}
