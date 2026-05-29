package br.com.ifsp.classify.models;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "CLASS_SESSION")
public class ClassSession implements Serializable {

    @JdbcTypeCode(SqlTypes.BIGINT)
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JdbcTypeCode(SqlTypes.BINARY)
    @Column(nullable = false, unique = true)
    private byte[] uuid;

    @ManyToOne
    @JoinColumn(name = "subject_teacher_id", nullable = false)
    private SubjectTeacher subjectTeacher;

    @ManyToOne
    @JoinColumn(name = "classroom_id", nullable = false)
    private Classroom classroom;

    @JdbcTypeCode(SqlTypes.LOCAL_DATE_TIME)
    @Column(nullable = false)
    private LocalDateTime startTime;

    @JdbcTypeCode(SqlTypes.LOCAL_DATE_TIME)
    @Column(nullable = false)
    private LocalDateTime endTime;

    @ManyToOne
    @JoinColumn(name = "report_id", nullable = true)
    private Report report;

    @ManyToOne
    @JoinColumn(name = "class_id", nullable = true)
    private Class classSessionClass;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = true)
    private Student student;

    @OneToMany(mappedBy = "assessment")
    private List<Assessment> assessments = new ArrayList<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public byte[] getUuid() {
        return uuid;
    }

    public void setUuid(byte[] uuid) {
        this.uuid = uuid;
    }

    public SubjectTeacher getSubjectTeacher() {
        return subjectTeacher;
    }

    public void setSubjectTeacher(SubjectTeacher subjectTeacher) {
        this.subjectTeacher = subjectTeacher;
    }

    public Classroom getClassroom() {
        return classroom;
    }

    public void setClassroom(Classroom classroom) {
        this.classroom = classroom;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public Report getReport() {
        return report;
    }

    public void setReport(Report report) {
        this.report = report;
    }

    public Class getClassSessionClass() {
        return classSessionClass;
    }

    public void setClassSessionClass(Class classSessionClass) {
        this.classSessionClass = classSessionClass;
    }

    public Student getStudent() {
        return student;
    }

    public void setStudent(Student student) {
        this.student = student;
    }

    public List<Assessment> getAssessments() {
        return assessments;
    }

    public void setAssessments(List<Assessment> assessments) {
        this.assessments = assessments;
    }
}