package br.com.ifsp.classify.models;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "ROLE")
public class Role implements Serializable {

    @JdbcTypeCode(SqlTypes.CHAR)
    @Id
    @Column(length = 5)
    private String id;

    @JdbcTypeCode(SqlTypes.VARCHAR)
    @Column(nullable = false, length = 80)
    private String description;

    @OneToMany(mappedBy = "role")
    private List<User> users = new ArrayList<>();

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<User> getUsers() {
        return users;
    }

    public void setUsers(List<User> users) {
        this.users = users;
    }
}