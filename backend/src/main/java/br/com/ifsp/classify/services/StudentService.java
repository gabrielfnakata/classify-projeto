package br.com.ifsp.classify.services;

import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DateUtil;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.ifsp.classify.dtos.create.GuardianCreateDTO;
import br.com.ifsp.classify.dtos.create.StudentCreateDTO;
import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;
import br.com.ifsp.classify.dtos.get.GuardianGetDTO;
import br.com.ifsp.classify.dtos.get.StudentGetDTO;
import br.com.ifsp.classify.dtos.update.GuardianUpdateDTO;
import br.com.ifsp.classify.dtos.update.StudentUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Address;
import br.com.ifsp.classify.models.Guardian;
import br.com.ifsp.classify.models.Student;
import br.com.ifsp.classify.models.Telephone;
import br.com.ifsp.classify.repositories.StudentRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;

@Service
public class StudentService extends AbstractService<Student, StudentCreateDTO, StudentGetDTO, StudentUpdateDTO, Long> {

    private static final DateTimeFormatter BR_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private final TelephoneService telephoneService;
    private final AddressService addressService;

    public StudentService(StudentRepository repository, TelephoneService telephoneService, AddressService addressService) {
        super(repository);
        this.telephoneService = telephoneService;
        this.addressService = addressService;
    }

    @Override
    StudentGetDTO returnDTO(Student student) {
        if (student == null)
            return null;

        return new StudentGetDTO(
            UuidUtils.convertBytesToString(student.getUuid()),
            student.getName(),
            student.getBirthDate(),
            student.getEmail(),
            student.getCpf(),
            student.getRegistrationDate(),
            returnDTO(student.getGuardians()),
            student.getTelephones()
                .stream()
                .map(telephone -> telephoneService.returnDTO(telephone))
                .toList()
        );
    }

    private List<GuardianGetDTO> returnDTO(List<Guardian> guardians) {
        if (guardians == null || guardians.isEmpty())
            return null;

        return guardians
            .stream()
            .map(guardian -> returnDTO(guardian))
            .toList();
    }

    private GuardianGetDTO returnDTO(Guardian guardian) {
        if (guardian == null)
            return null;

        return new GuardianGetDTO(
                UuidUtils.convertBytesToString(guardian.getUuid()),
                guardian.getName(),
                guardian.getCpf(),
                guardian.getEmail(),
                addressService.returnDTO(guardian.getAddress())
        );
    }

    @Override
    public StudentGetDTO create(StudentCreateDTO studentDTO) {
        if (studentDTO == null)
            return null;

        if (Utils.isNullOrEmpty(studentDTO.name()))
            throw new DtoException("O nome do aluno não pode ser nulo ou vazio");

        if (!Utils.isNullOrEmpty(studentDTO.cpf()) && !Utils.cpfValidator(studentDTO.cpf()))
            throw new DtoException("O CPF informado é inválido");

        if (studentDTO.registrationDate() == null)
            throw new DtoException("A data de matrícula do aluno não pode ser nula");

        Student newStudent = new Student();
        newStudent.setUuid(UuidUtils.generateUUID());
        newStudent.setName(Utils.trimAndUpper(studentDTO.name()));
        newStudent.setBirthDate(studentDTO.birthDate());
        newStudent.setEmail(Utils.trimAndUpper(studentDTO.email()));
        newStudent.setCpf(Utils.removeAllNonDigits(studentDTO.cpf()));
        newStudent.setRegistrationDate(studentDTO.registrationDate());

        if (Utils.hasElements(studentDTO.guardians())) {
            for (GuardianCreateDTO guardian : studentDTO.guardians()) {
                Guardian newGuardian = create(guardian);

                if (newGuardian != null)
                    newStudent.addGuardian(newGuardian);
            }
        }

        if (Utils.hasElements(studentDTO.telephones())) {
            for (TelephoneCreateDTO telephone : studentDTO.telephones()) {
                Telephone newTelephone = telephoneService.create(telephone);
                
                if (newTelephone != null) {
                    newStudent.addTelephone(newTelephone);
                }
            }
        }

        repository.save(newStudent);

        return returnDTO(newStudent);
    }

    @Override
    public StudentGetDTO update(String uuid, StudentUpdateDTO studentDTO) {
        Student student = getEntityById(uuid);
        if (studentDTO == null || student == null)
            return null;

        if (!Utils.isNullOrEmpty(studentDTO.name()))
            student.setName(Utils.trimAndUpper(studentDTO.name()));

        if (studentDTO.birthDate() != null)
            student.setBirthDate(studentDTO.birthDate());

        if (!Utils.isNullOrEmpty(studentDTO.email()))
            student.setEmail(Utils.trimAndUpper(studentDTO.email().trim()));

        if (!Utils.isNullOrEmpty(studentDTO.cpf()) && Utils.cpfValidator(studentDTO.cpf()))
            student.setCpf(Utils.removeAllNonDigits(studentDTO.cpf()));
        
        if (studentDTO.registrationDate() != null)
            student.setRegistrationDate(studentDTO.registrationDate());

        // TODO: Fazer a validação de telephones já existentes
        // if (Utils.hasElements(studentDTO.telephones())) {
            
        // }

        repository.save(student);

        return returnDTO(student);
    }

    public List<GuardianGetDTO> addGuardians(String studentUuid, List<GuardianCreateDTO> guardiansDTO) {
        if (!Utils.hasElements(guardiansDTO))
            return null;

        Student student = getEntityById(studentUuid);
        if (student == null)
            throw new DtoException("O aluno informado não existe");

        for (GuardianCreateDTO guardian : guardiansDTO) {
            Guardian newGuardian = create(guardian);

            if (newGuardian != null)
                student.addGuardian(newGuardian);
        }

        repository.save(student);

        return returnDTO(student.getGuardians());
    }

    public GuardianGetDTO updateGuardian(String uuid, String guardianUuid, GuardianUpdateDTO guardianDTO) {
        // Student student = getEntityById(uuid);
        // if (student == null || guardianDTO == null)
        //     return null;

        // if (Utils.isNullOrEmpty(guardianDTO.name()) && Utils.isNullOrEmpty(guardianDTO.telephone()))
        //     throw new DtoException("Nenhum campo foi informado para alteração");

        // Guardian guardianToBeReturned = new Guardian();
        // student.getGuardians()
        //         .stream()
        //         .filter(guardian -> UuidUtils.convertBytesToString(guardian.getUuid()).equals(guardianUuid.trim()))
        //         .findFirst()
        //         .ifPresentOrElse((guardian) -> {
        //             if (!Utils.isNullOrEmpty(guardianDTO.name()))
        //                 guardian.setName(guardianDTO.name().trim().toUpperCase());

        //             if (!Utils.isNullOrEmpty(guardianDTO.telephone()))
        //                 guardian.setTelephone(guardianDTO.telephone().trim());

        //             guardianToBeReturned.setUuid(guardian.getUuid());
        //             guardianToBeReturned.setName(guardian.getName());
        //             guardianToBeReturned.setTelephone(guardian.getTelephone());
        //         }, () -> {
        //             throw new DtoException("O responsável informado não existe");
        //         });

        // repository.save(student);

        // return returnDTO(guardianToBeReturned);
        return null;
    }

    private Guardian create(GuardianCreateDTO guardianDTO) {
        if (guardianDTO == null)
            return null;

        if (Utils.isNullOrEmpty(guardianDTO.name()))
            throw new DtoException("O nome do responsável não pode ser nulo ou vazio");

        if (!Utils.isNullOrEmpty(guardianDTO.cpf()) && !Utils.cpfValidator(guardianDTO.cpf()))
            throw new DtoException("O CPF informado é inválido");

        if (Utils.isNullOrEmpty(guardianDTO.email()))
            throw new DtoException("O email do responsável não pode ser nulo");

        Guardian newGuardian = new Guardian();
        newGuardian.setUuid(UuidUtils.generateUUID());
        newGuardian.setName(Utils.trimAndUpper(guardianDTO.name()));
        newGuardian.setCpf(Utils.removeAllNonDigits(guardianDTO.cpf()));
        newGuardian.setEmail(Utils.trimAndUpper(guardianDTO.email()));
        
        Address newAddress = (guardianDTO.address() != null)
            ? addressService.create(guardianDTO.address())
            : null;
        newGuardian.setAddress(newAddress);

        if (Utils.hasElements(guardianDTO.telephones())) {
            for (TelephoneCreateDTO telephone : guardianDTO.telephones()) {
                Telephone newTelephone = telephoneService.create(telephone);

                if (newTelephone != null) {
                    newGuardian.addTelephone(newTelephone);
                }
            }
        }

        return newGuardian;
    }

    public byte[] generateTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            var sheet = workbook.createSheet("students");
            var header = sheet.createRow(0);
            String[] headers = new String[]{"name","birthDate","email","cpf","registrationDate","telephone1","telephone2"};
            var textFormat = workbook.createCellStyle();
            textFormat.setDataFormat(workbook.createDataFormat().getFormat("@"));

            for (int i = 0; i < headers.length; i++) {
                var cell = header.createCell(i);
                cell.setCellValue(headers[i]);
                sheet.autoSizeColumn(i);
            }

            int[] textColumns = {1, 3, 4, 5, 6};
            for (int col : textColumns) {
                sheet.setDefaultColumnStyle(col, textFormat);
            }

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao gerar template de planilha", ex);
        }
    }

    public record ImportError(int row, String reason) {}

    public record ImportResult(List<StudentGetDTO> created, List<ImportError> errors) {}

    public ImportResult importFromExcel(MultipartFile file) {
        if (file == null || file.isEmpty())
            return new ImportResult(Collections.emptyList(), Collections.emptyList());

        try (InputStream in = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(in)) {

            var sheet = workbook.getSheetAt(0);
            List<StudentGetDTO> imported = new ArrayList<>();
            List<ImportError> errors = new ArrayList<>();

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                var row = sheet.getRow(r);
                if (row == null) continue;

                int humanRow = r + 1;

                try {
                    String name = getCellString(row, 0);

                    if (Utils.isNullOrEmpty(name)) continue;

                    String birthDateStr = getCellString(row, 1);
                    String email = getCellString(row, 2);
                    String cpf = getCellString(row, 3);
                    String registrationDateStr = getCellString(row, 4);
                    String telephone1 = getCellString(row, 5);
                    String telephone2 = getCellString(row, 6);

                    LocalDate birthDate = parseDate(birthDateStr);
                    LocalDate registrationDate = parseDate(registrationDateStr);

                    List<TelephoneCreateDTO> telephones = new ArrayList<>();
                    if (!Utils.isNullOrEmpty(telephone1))
                        telephones.add(new TelephoneCreateDTO(null, null, Utils.removeAllNonDigits(telephone1)));
                    if (!Utils.isNullOrEmpty(telephone2))
                        telephones.add(new TelephoneCreateDTO(null, null, Utils.removeAllNonDigits(telephone2)));

                    var studentDTO = new StudentCreateDTO(
                            name,
                            birthDate,
                            email,
                            cpf,
                            registrationDate,
                            telephones,
                            null
                    );

                    StudentGetDTO created = create(studentDTO);
                    if (created != null) imported.add(created);

                } catch (DtoException dtoEx) {
                    errors.add(new ImportError(humanRow, dtoEx.getMessage()));
                } catch (Exception rowEx) {
                    String reason = (rowEx.getCause() != null)
                            ? rowEx.getCause().getMessage()
                            : rowEx.getMessage();
                    errors.add(new ImportError(humanRow, reason != null ? reason : "Erro desconhecido ao processar a linha"));
                }
            }

            return new ImportResult(imported, errors);
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao importar alunos da planilha", ex);
        }
    }

    public List<Map<String, String>> previewFromExcel(MultipartFile file) {
        if (file == null || file.isEmpty())
            return Collections.emptyList();

        try (InputStream in = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(in)) {

            var sheet = workbook.getSheetAt(0);
            List<Map<String, String>> preview = new ArrayList<>();

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                var row = sheet.getRow(r);
                if (row == null) continue;

                String name = getCellString(row, 0);
                if (Utils.isNullOrEmpty(name)) continue;

                Map<String, String> rowData = new LinkedHashMap<>();
                rowData.put("name", name);
                rowData.put("birthDate", getCellString(row, 1));
                rowData.put("email", getCellString(row, 2));
                rowData.put("cpf", getCellString(row, 3));
                rowData.put("registrationDate", getCellString(row, 4));
                rowData.put("telephone1", getCellString(row, 5));
                rowData.put("telephone2", getCellString(row, 6));

                preview.add(rowData);
            }

            return preview;
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao gerar pré-visualização", ex);
        }
    }

    public byte[] exportToExcel(List<StudentGetDTO> students) {
        try (XSSFWorkbook workbook = new XSSFWorkbook();
             ByteArrayOutputStream out = new ByteArrayOutputStream()) {

            var sheet = workbook.createSheet("students");
            var header = sheet.createRow(0);
            String[] headers = new String[]{"name","birthDate","email","cpf","registrationDate","telephone1","telephone2"};

            for (int i = 0; i < headers.length; i++) {
                var cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }

            int rownum = 1;
            for (StudentGetDTO s : students) {
                var row = sheet.createRow(rownum++);
                row.createCell(0).setCellValue(s.name() != null ? s.name() : "");
                row.createCell(1).setCellValue(s.birthDate() != null ? s.birthDate().format(BR_DATE_FORMAT) : "");
                row.createCell(2).setCellValue(s.email() != null ? s.email() : "");
                row.createCell(3).setCellValue(s.cpf() != null ? s.cpf() : "");
                row.createCell(4).setCellValue(s.registrationDate() != null ? s.registrationDate().format(BR_DATE_FORMAT) : "");

                String tel1 = "";
                String tel2 = "";
                if (s.telephones() != null && !s.telephones().isEmpty()) {
                    if (s.telephones().size() > 0) tel1 = s.telephones().get(0).number();
                    if (s.telephones().size() > 1) tel2 = s.telephones().get(1).number();
                }

                row.createCell(5).setCellValue(tel1);
                row.createCell(6).setCellValue(tel2);
            }

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao exportar alunos para planilha", ex);
        }
    }

    public List<StudentGetDTO> findAllFiltered(Map<String,String> filters) {
        List<StudentGetDTO> all = this.findAll();
        if (filters == null || filters.isEmpty()) return all;

        String name = filters.getOrDefault("name", "").trim().toLowerCase();
        String email = filters.getOrDefault("email", "").trim().toLowerCase();
        String cpf = filters.getOrDefault("cpf", "").trim().replaceAll("\\D", "");
        String telephone = filters.getOrDefault("telephone", "").trim();
        String birthDate = filters.getOrDefault("birthDate", "").trim();

        return all.stream().filter(s -> {
            boolean ok = true;
            if (!name.isEmpty()) ok &= s.name() != null && s.name().toLowerCase().contains(name);
            if (!email.isEmpty()) ok &= s.email() != null && s.email().toLowerCase().contains(email);
            if (!cpf.isEmpty()) ok &= s.cpf() != null && s.cpf().replaceAll("\\D", "").contains(cpf);
            if (!telephone.isEmpty()) {
                ok &= (s.telephones() != null && s.telephones().stream().anyMatch(t -> t.number() != null && t.number().contains(telephone)));
            }
            if (!birthDate.isEmpty()) {
                ok &= (s.birthDate() != null && s.birthDate().toString().equals(birthDate));
            }
            return ok;
        }).toList();
    }

    private String getCellString(Row row, int idx) {
        Cell cell = row.getCell(idx);
        if (cell == null) return null;

        switch (cell.getCellType()) {
            case STRING:
                String s = cell.getStringCellValue();
                return (s != null && !s.isBlank()) ? s.trim() : null;

            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    LocalDate date = cell.getLocalDateTimeCellValue().toLocalDate();
                    return date.format(BR_DATE_FORMAT);
                }
                double num = cell.getNumericCellValue();
                if (num == Math.floor(num)) {
                    return String.valueOf((long) num);
                }
                return String.valueOf(num);

            case FORMULA:
                try {
                    return cell.getStringCellValue().trim();
                } catch (Exception ex) {
                    return String.valueOf(cell.getNumericCellValue());
                }

            case BLANK:
                return null;

            default:
                return cell.toString().trim();
        }
    }

    private LocalDate parseDate(String s) {
        if (Utils.isNullOrEmpty(s)) return null;

        try {
            return LocalDate.parse(s, BR_DATE_FORMAT);
        } catch (Exception ex) {
            try {
                return LocalDate.parse(s);
            } catch (Exception e) {
                return null;
            }
        }
    }
}