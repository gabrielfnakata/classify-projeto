package br.com.ifsp.classify.models;

import jakarta.persistence.*;

import java.io.Serializable;

@Entity
public class Subject implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private Byte[] uuid;

    @Column(nullable = false, unique = true, length = 40)
    private String description;

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Byte[] getUuid() {
        return uuid;
    }

    public void setUuid(Byte[] uuid) {
        this.uuid = uuid;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}