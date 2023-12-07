create table students (
	department_id BIGSERIAL not null PRIMARY KEY ,
	subject_name VARCHAR(18),
	teacher_name VARCHAR(50),
	textbook VARCHAR(18),
	grade_scale VARCHAR(1),
	homework_count INT,
	final_exam_date DATE
);
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('Science', 'Alta Semaine', 'Geography', 'F', 8, '2023/5/24');
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('Science', 'Emiline Loughead', 'Biology', 'F', 1, '2023/5/4');
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('Art', 'Dorthy Garrand', 'Physical Education', 'C', 2, '2023/5/2');
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('English', 'Christina Gower', 'Shakespeare', 'A', 8, '2023/5/25');
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('History', 'Ephrem Salters', 'Biology', 'A', 1, '2023/5/27');
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('Literature', 'Carol Ballefant', 'Art History', 'C', 9, '2023/5/22');
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('Music', 'Cody Buzek', 'Biology', 'D', 1, '2023/5/2');
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('History', 'Linn McGivena', 'Computer Science', 'B', 9, '2023/5/30');
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('Math', 'Celestina Reeson', 'Biology', 'D', 8, '2023/5/29');
insert into department (subject_name, teacher_name, textbook, grade_scale, homework_count, final_exam_date) values ('Music', 'Elinor Tampin', 'Geography', 'D', 10, '2023/5/9');
