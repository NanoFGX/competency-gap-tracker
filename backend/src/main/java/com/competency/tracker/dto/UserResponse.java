package com.competency.tracker.dto;

import com.competency.tracker.model.AppUser;

public class UserResponse {
    private String id;
    private String name;
    private String email;
    private String role;
    private String program;
    private String university;
    private Integer graduationYear;
    private String company;
    private String title;

    public static UserResponse from(AppUser user) {
        UserResponse r = new UserResponse();
        r.id = user.getId();
        r.name = user.getName();
        r.email = user.getEmail();
        r.role = user.getRole();
        r.program = user.getProgram();
        r.university = user.getUniversity();
        r.graduationYear = user.getGraduationYear();
        r.company = user.getCompany();
        r.title = user.getTitle();
        return r;
    }

    public String getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getRole() { return role; }
    public String getProgram() { return program; }
    public String getUniversity() { return university; }
    public Integer getGraduationYear() { return graduationYear; }
    public String getCompany() { return company; }
    public String getTitle() { return title; }
}
