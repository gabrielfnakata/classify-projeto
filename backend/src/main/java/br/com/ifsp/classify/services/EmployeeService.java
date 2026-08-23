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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import br.com.ifsp.classify.dtos.create.EmployeeCreateDTO;
import br.com.ifsp.classify.dtos.create.TelephoneCreateDTO;
import br.com.ifsp.classify.dtos.create.UserCreateDTO;
import br.com.ifsp.classify.dtos.get.EmployeeGetDTO;
import br.com.ifsp.classify.dtos.update.EmployeeUpdateDTO;
import br.com.ifsp.classify.exceptions.DtoException;
import br.com.ifsp.classify.models.Employee;
import br.com.ifsp.classify.models.Telephone;
import br.com.ifsp.classify.models.User;
import br.com.ifsp.classify.repositories.EmployeeRepository;
import br.com.ifsp.classify.repositories.RoleRepository;
import br.com.ifsp.classify.utils.Utils;
import br.com.ifsp.classify.utils.UuidUtils;

@Service
public class EmployeeService extends AbstractService<Employee, EmployeeCreateDTO, EmployeeGetDTO, EmployeeUpdateDTO, Long> {

    private final TelephoneService telephoneService;
    private final UserService userService;
    private final RoleRepository roleRepository;

    public EmployeeService(EmployeeRepository repository, RoleRepository roleRepository, PasswordEncoder passwordEncoder, TelephoneService telephoneService, UserService userService) {
        super(repository);
        this.telephoneService = telephoneService;
        this.userService = userService;
        this.roleRepository = roleRepository;
    }

    @Override
    EmployeeGetDTO returnDTO(Employee employee) {
        if (employee == null)
            return null;

        String email = employee.getUser() != null ? employee.getUser().getEmail() : null;
        String roleId = (employee.getUser() != null && employee.getUser().getRole() != null)
                ? employee.getUser().getRole().getId()
                : null;

        return new EmployeeGetDTO(
                UuidUtils.convertBytesToString(employee.getUuid()),
                employee.getName(),
                employee.getBirthDate(),
                employee.getCpf(),
                employee.getHireDate(),
                email,
                roleId,
                employee.getTelephones()
                    .stream()
                    .map(telephone -> telephoneService.returnDTO(telephone))
                    .toList(),
                UuidUtils.convertBytesToString(employee.getUuid())
        );
    }

    @Override
    public EmployeeGetDTO create(EmployeeCreateDTO employeeDTO) {
        if (employeeDTO == null)
            return null;

        if (Utils.isNullOrEmpty(employeeDTO.name()))
            throw new DtoException("O nome do funcionário não pode ser vazio ou nulo");

        if (Utils.isNullOrEmpty(employeeDTO.cpf())) {
            throw new DtoException("O CPF do funcionário não pode ser nulo ou vazio");
        }
        else if (!Utils.cpfValidator(employeeDTO.cpf())) {
            throw new DtoException("O CPF informado é inválido");
        }

        Employee newEmployee = new Employee();
        newEmployee.setUuid(UuidUtils.generateUUID());
        newEmployee.setName(Utils.trimAndUpper(employeeDTO.name()));
        newEmployee.setBirthDate(employeeDTO.birthDate());
        newEmployee.setCpf(Utils.removeAllNonDigits(employeeDTO.cpf()));
        newEmployee.setHireDate(employeeDTO.hireDate());
            
        User newUser = userService.createUserFromEmployee(employeeDTO.user());
        newEmployee.setUser(newUser);

        if (Utils.hasElements(employeeDTO.telephones())) {
            for (TelephoneCreateDTO telephone : employeeDTO.telephones()) {
                Telephone newTelephone = telephoneService.create(telephone);

                if (newTelephone != null)
                    newEmployee.addTelephone(newTelephone);
            }
        }

        repository.save(newEmployee);

        return returnDTO(newEmployee);
    }

    public record ImportError(int row, String reason) {}
    public record ImportResult(List<EmployeeGetDTO> created, List<ImportError> errors) {}

    private static final DateTimeFormatter BR_DATE_FORMAT = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    private org.apache.poi.ss.usermodel.CellStyle buildEmployeeHeaderStyle(Workbook workbook) {
        var headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setColor(org.apache.poi.ss.usermodel.IndexedColors.WHITE.getIndex());

        var headerStyle = workbook.createCellStyle();
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(org.apache.poi.ss.usermodel.IndexedColors.TEAL.getIndex());
        headerStyle.setFillPattern(org.apache.poi.ss.usermodel.FillPatternType.SOLID_FOREGROUND);
        headerStyle.setAlignment(org.apache.poi.ss.usermodel.HorizontalAlignment.CENTER);
        headerStyle.setVerticalAlignment(org.apache.poi.ss.usermodel.VerticalAlignment.CENTER);
        headerStyle.setBorderTop(org.apache.poi.ss.usermodel.BorderStyle.THIN);
        headerStyle.setBorderBottom(org.apache.poi.ss.usermodel.BorderStyle.THIN);
        headerStyle.setBorderLeft(org.apache.poi.ss.usermodel.BorderStyle.THIN);
        headerStyle.setBorderRight(org.apache.poi.ss.usermodel.BorderStyle.THIN);
        return headerStyle;
    }

    private void applyEmployeeHeaderFormatting(Workbook workbook, org.apache.poi.ss.usermodel.Sheet sheet, Row header) {
        var headerStyle = buildEmployeeHeaderStyle(workbook);
        for (int i = 0; i < header.getLastCellNum(); i++) {
            var cell = header.getCell(i);
            if (cell == null) {
                cell = header.createCell(i);
            }
            cell.setCellStyle(headerStyle);
        }

        var textFormat = workbook.createCellStyle();
        textFormat.setDataFormat(workbook.createDataFormat().getFormat("@"));
        int[] textColumns = {1, 3, 6, 7};
        for (int col : textColumns) {
            sheet.setDefaultColumnStyle(col, textFormat);
        }

        header.getCell(1).setCellComment(makeComment(workbook, sheet, "Formato: DD/MM/AAAA"));
        header.getCell(3).setCellComment(makeComment(workbook, sheet, "Formato: DD/MM/AAAA"));
        header.getCell(5).setCellComment(makeComment(workbook, sheet, "Cargos válidos: roleId cadastrado no sistema"));
        header.getCell(6).setCellComment(makeComment(workbook, sheet, "Formato: (99)99999-9999"));
        header.getCell(7).setCellComment(makeComment(workbook, sheet, "Formato: (99)99999-9999 (opcional)"));
    }

    public byte[] generateTemplate() {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("Funcionários");
            var header = sheet.createRow(0);

            String[] headers = new String[]{
                "Nome",
                "Data de Nascimento",
                "CPF",
                "Data de Contratação",
                "E-mail",
                "Cargo",
                "Telefone 1",
                "Telefone 2"
            };

            for (int i = 0; i < headers.length; i++) {
                var cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }

            applyEmployeeHeaderFormatting(workbook, sheet, header);

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao gerar template de funcionários", ex);
        }
    }

    private org.apache.poi.ss.usermodel.Comment makeComment(Workbook workbook, org.apache.poi.ss.usermodel.Sheet sheet, String text) {
        var factory = workbook.getCreationHelper();
        var drawing = sheet.createDrawingPatriarch();
        var anchor = factory.createClientAnchor();
        var comment = drawing.createCellComment(anchor);
        comment.setString(factory.createRichTextString(text));
        comment.setAuthor("Sistema");
        return comment;
    }

    public ImportResult importFromExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) return new ImportResult(Collections.emptyList(), Collections.emptyList());

        try (InputStream in = file.getInputStream(); Workbook workbook = WorkbookFactory.create(in)) {
            var sheet = workbook.getSheetAt(0);
            List<EmployeeGetDTO> imported = new ArrayList<>();
            List<ImportError> errors = new ArrayList<>();

            for (int r = 1; r <= sheet.getLastRowNum(); r++) {
                var row = sheet.getRow(r);
                if (row == null) continue;

                int humanRow = r + 1;
                try {
                    String name = getCellString(row, 0);
                    if (Utils.isNullOrEmpty(name)) continue;

                    String birthDateStr = getCellString(row, 1);
                    String cpf = getCellString(row, 2);
                    String hireDateStr = getCellString(row, 3);
                    
                    String email = getCellString(row, 4);
                    String roleId = getCellString(row, 5);
                    String telephone1 = getCellString(row, 6);
                    String telephone2 = getCellString(row, 7);

                    LocalDate birthDate = parseDate(birthDateStr);
                    LocalDate hireDate = parseDate(hireDateStr);

                    List<TelephoneCreateDTO> telephones = new ArrayList<>();
                    if (!Utils.isNullOrEmpty(telephone1)) telephones.add(new TelephoneCreateDTO(null, null, Utils.removeAllNonDigits(telephone1)));
                    if (!Utils.isNullOrEmpty(telephone2)) telephones.add(new TelephoneCreateDTO(null, null, Utils.removeAllNonDigits(telephone2)));

                    if (Utils.isNullOrEmpty(roleId) || !roleRepository.findById(roleId).isPresent()) {
                        errors.add(new ImportError(humanRow, "Cargo (roleId) inválido ou ausente: " + roleId));
                        continue;
                    }

                    UserCreateDTO userDto = null;
                    if (!Utils.isNullOrEmpty(email)) {
                        String generatedPassword = "ChangeMe@" + System.currentTimeMillis();
                        userDto = new UserCreateDTO(email, generatedPassword, roleId, null);
                    }

                    var employeeDTO = new EmployeeCreateDTO(name, birthDate, cpf, hireDate, userDto, telephones);

                    EmployeeGetDTO created = create(employeeDTO);
                    if (created != null) imported.add(created);

                } catch (DtoException dtoEx) {
                    errors.add(new ImportError(humanRow, dtoEx.getMessage()));
                } catch (Exception rowEx) {
                    String reason = (rowEx.getCause() != null) ? rowEx.getCause().getMessage() : rowEx.getMessage();
                    errors.add(new ImportError(humanRow, reason != null ? reason : "Erro desconhecido ao processar a linha"));
                }
            }

            return new ImportResult(imported, errors);
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao importar funcionários da planilha", ex);
        }
    }

    public List<Map<String, String>> previewFromExcel(MultipartFile file) {
        if (file == null || file.isEmpty()) return Collections.emptyList();

        try (InputStream in = file.getInputStream(); Workbook workbook = WorkbookFactory.create(in)) {
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
                rowData.put("cpf", getCellString(row, 2));
                rowData.put("hireDate", getCellString(row, 3));
                rowData.put("email", getCellString(row, 4));
                rowData.put("roleId", getCellString(row, 5));
                rowData.put("telephone1", getCellString(row, 6));
                rowData.put("telephone2", getCellString(row, 7));

                preview.add(rowData);
            }

            return preview;
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao gerar pré-visualização de funcionários", ex);
        }
    }

    public byte[] exportToExcel(List<EmployeeGetDTO> employees) {
        try (XSSFWorkbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            var sheet = workbook.createSheet("Funcionários");
            var header = sheet.createRow(0);
            String[] headers = new String[]{
                "Nome",
                "Data de Nascimento",
                "CPF",
                "Data de Contratação",
                "E-mail",
                "Cargo",
                "Telefone 1",
                "Telefone 2"
            };

            for (int i = 0; i < headers.length; i++) {
                var cell = header.createCell(i);
                cell.setCellValue(headers[i]);
            }
            applyEmployeeHeaderFormatting(workbook, sheet, header);

            int rownum = 1;
            for (EmployeeGetDTO s : employees) {
                var row = sheet.createRow(rownum++);
                row.createCell(0).setCellValue(s.name() != null ? s.name() : "");
                row.createCell(1).setCellValue(s.birthDate() != null ? s.birthDate().format(BR_DATE_FORMAT) : "");
                row.createCell(2).setCellValue(s.cpf() != null ? s.cpf() : "");
                row.createCell(3).setCellValue(s.hireDate() != null ? s.hireDate().format(BR_DATE_FORMAT) : "");
                row.createCell(4).setCellValue(s.email() != null ? s.email() : "");
                row.createCell(5).setCellValue(s.roleId() != null ? s.roleId() : "");

                String tel1 = "";
                String tel2 = "";
                if (s.telephones() != null && !s.telephones().isEmpty()) {
                    if (s.telephones().size() > 0) tel1 = s.telephones().get(0).number();
                    if (s.telephones().size() > 1) tel2 = s.telephones().get(1).number();
                }

                row.createCell(6).setCellValue(tel1);
                row.createCell(7).setCellValue(tel2);
            }

            for (int i = 0; i < headers.length; i++) sheet.autoSizeColumn(i);

            workbook.write(out);
            return out.toByteArray();
        } catch (Exception ex) {
            throw new RuntimeException("Erro ao exportar funcionários para planilha", ex);
        }
    }

    public List<EmployeeGetDTO> findAllFiltered(Map<String,String> filters) {
        List<EmployeeGetDTO> all = this.findAll();
        if (filters == null || filters.isEmpty()) return all;

        String name = filters.getOrDefault("name", "").trim().toLowerCase();
        String cpf = filters.getOrDefault("cpf", "").trim().replaceAll("\\D", "");
        String email = filters.getOrDefault("email", "").trim().toLowerCase();
        String position = filters.getOrDefault("position", "").trim().toLowerCase();

        return all.stream().filter(s -> {
            boolean ok = true;
            if (!name.isEmpty()) ok &= s.name() != null && s.name().toLowerCase().contains(name);
            if (!cpf.isEmpty()) ok &= s.cpf() != null && s.cpf().replaceAll("\\D", "").contains(cpf);
            if (!email.isEmpty()) ok &= s.email() != null && s.email().toLowerCase().contains(email);
            if (!position.isEmpty()) {
                String roleValue = s.roleId() != null ? s.roleId().toLowerCase() : "";
                ok &= !roleValue.isEmpty() && roleValue.contains(position);
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

    @Override
    public EmployeeGetDTO update(String employeeUuid, EmployeeUpdateDTO employeeDTO) {
        Employee employee = getEntityById(employeeUuid);
        if (employee == null || employeeDTO == null)
            return null;

        if (!Utils.isNullOrEmpty(employeeDTO.name()))
            employee.setName(Utils.trimAndUpper(employeeDTO.name()));

        if (employeeDTO.birthDate() != null)
            employee.setBirthDate(employeeDTO.birthDate());

        if (!Utils.isNullOrEmpty(employeeDTO.cpf()) && Utils.cpfValidator(employeeDTO.cpf()))
            employee.setCpf(Utils.removeAllNonDigits(employeeDTO.cpf()));

        if (employeeDTO.hireDate() != null)
            employee.setHireDate(employeeDTO.hireDate());

        if (employeeDTO.user() != null) {
            User userUpdated = userService.updateUser(employeeUuid, employeeDTO.user());

            if (userUpdated == null)
                throw new DtoException("Erro ao atualizar o usuário");    
            
            employee.setUser(userUpdated);
        }

        repository.save(employee);

        return returnDTO(employee);
    }
}