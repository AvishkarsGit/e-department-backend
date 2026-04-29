import User from "../models/User";
import Faculty from "../models/Faculty";
import Student from "../models/Student";
import Department from "../models/Department";
import Class from "../models/Class";
import Subject from "../models/Subject";
import Period from "../models/Period";
import ClassSession from "../models/ClassSession";
import Attendance from "../models/Attendance";
import AttendanceSummary from "../models/AttendanceSummary";
import { JWT } from "../utils/JWT";
import { students, faculties, admin as adminData } from "../utils/data";

export class SeederController {
    static async seedUsers(req, res, next) {
        try {
            const startTime = Date.now();
            console.log("Seeding started at:", new Date(startTime).toLocaleString());

            // 1. Seed Departments
            const departmentsData = [{ name: "Computer Engineering" }, { name: "Information Technology" }, { name: "Mechanical Engineering" }];
            const seededDepartments = [];
            for (const d of departmentsData) {
                let dept = await Department.findOne({ name: d.name });
                if (!dept) dept = await new Department(d).save();
                seededDepartments.push(dept);
            }
            const compDept = seededDepartments[0];

            // 2. Seed Periods
            const periodsData = [
                { period_text: "Period 1", period: 1, start_time: "09:00 AM", ending_time: "10:00 AM" },
                { period_text: "Period 2", period: 2, start_time: "10:00 AM", ending_time: "11:00 AM" },
                { period_text: "Period 3", period: 3, start_time: "11:15 AM", ending_time: "12:15 PM" },
                { period_text: "Period 4", period: 4, start_time: "12:15 PM", ending_time: "01:15 PM" },
                { period_text: "Period 5", period: 5, start_time: "02:00 PM", ending_time: "03:00 PM" }
            ];
            const seededPeriods = [];
            for (const p of periodsData) {
                let per = await Period.findOne({ period: p.period });
                if (!per) per = await new Period(p).save();
                seededPeriods.push(per);
            }

            // 3. Seed Classes (4 Years, 2 Semesters each)
            const seededClasses = [];
            for (let year = 1; year <= 4; year++) {
                for (let sem = 1; sem <= 2; sem++) {
                    let cls = await Class.findOne({ department_id: compDept._id, year, semester: sem });
                    if (!cls) cls = await new Class({ department_id: compDept._id, year, semester: sem }).save();
                    seededClasses.push(cls);
                }
            }

            // 4. Seed Subjects for each Class
            const seededSubjects = [];
            for (const cls of seededClasses) {
                const subs = [
                    { name: `Subject A (Year ${cls.year} Sem ${cls.semester})`, code: `Y${cls.year}S${cls.semester}A`, class_id: cls._id },
                    { name: `Subject B (Year ${cls.year} Sem ${cls.semester})`, code: `Y${cls.year}S${cls.semester}B`, class_id: cls._id }
                ];
                for (const s of subs) {
                    let sub = await Subject.findOne({ code: s.code });
                    if (!sub) sub = await new Subject(s).save();
                    seededSubjects.push(sub);
                }
            }

            // 5. Seed Admin
            let adminUser = await User.findOne({ email: adminData.email });
            if (!adminUser) {
                const hashedPass = await JWT.encryptPassword(adminData.password);
                adminUser = await new User({ ...adminData, password: hashedPass }).save();
                await new Faculty({
                    user_id: adminUser._id,
                    department_id: compDept._id,
                    subjects: seededSubjects.slice(0, 5).map(s => s._id)
                }).save();
            }

            // 6. Seed Faculties
            const facultyIds = [];
            for (const f of faculties) {
                let fUser = await User.findOne({ email: f.email });
                if (!fUser) {
                    const hashedPass = await JWT.encryptPassword(f.password);
                    fUser = await new User({ ...f, password: hashedPass }).save();
                    const faculty = await new Faculty({
                        user_id: fUser._id,
                        department_id: compDept._id,
                        subjects: seededSubjects.slice(5, 10).map(s => s._id)
                    }).save();
                    facultyIds.push(faculty._id);
                } else {
                    const faculty = await Faculty.findOne({ user_id: fUser._id });
                    if (faculty) facultyIds.push(faculty._id);
                }
            }

            // 7. Seed Students and distribute them across years
            const studentIds = [];
            for (let i = 0; i < students.length; i++) {
                const s = students[i];
                let sUser = await User.findOne({ email: s.email });
                const classToAssign = seededClasses[i % seededClasses.length]; // Distribute students

                if (!sUser) {
                    const hashedPass = await JWT.encryptPassword(s.password);
                    sUser = await new User({ ...s, password: hashedPass, account_status: true, email_verified: true }).save();
                    const student = await new Student({
                        user_id: sUser._id,
                        class_id: classToAssign._id,
                        rollNo: i + 1,
                        guardian: [{ name: "Guardian " + (i + 1), relation: "Parent", phone: s.phone }]
                    }).save();
                    studentIds.push({ id: student._id, class_id: classToAssign._id });
                } else {
                    const student = await Student.findOne({ user_id: sUser._id });
                    if (student) studentIds.push({ id: student._id, class_id: classToAssign._id });
                }
            }

            // 8. Seed Historical Attendance (Last 30 days)
            console.log("Seeding historical Attendance records (30 days)...");
            const today = new Date();
            const attendanceStats: any = {};

            for (let d = 30; d >= 0; d--) {
                const date = new Date();
                date.setDate(today.getDate() - d);
                date.setHours(0, 0, 0, 0);

                if (date.getDay() === 0 || date.getDay() === 6) continue;

                // For each class, create sessions and attendance
                for (const cls of seededClasses) {
                    const classSubjects = seededSubjects.filter(s => s.class_id.toString() === cls._id.toString());
                    const classStudents = studentIds.filter(s => s.class_id.toString() === cls._id.toString());

                    for (let sIdx = 0; sIdx < classSubjects.length; sIdx++) {
                        const subject = classSubjects[sIdx];
                        const faculty_id = facultyIds[sIdx % facultyIds.length];
                        const period = seededPeriods[sIdx % seededPeriods.length];

                        let session = await ClassSession.findOne({ class_id: cls._id, subject_id: subject._id, date, period: period._id });
                        if (!session) {
                            session = await new ClassSession({ class_id: cls._id, subject_id: subject._id, faculty_id, period: period._id, date }).save();

                            for (const studentInfo of classStudents) {
                                const isPresent = Math.random() > 0.20; // 80% attendance
                                const status = isPresent ? "present" : "absent";

                                await new Attendance({
                                    session_id: session._id,
                                    student_id: studentInfo.id,
                                    class_id: cls._id,
                                    subject_id: subject._id,
                                    date,
                                    status
                                }).save();

                                const key = `${studentInfo.id}_${subject._id}`;
                                if (!attendanceStats[key]) attendanceStats[key] = { total: 0, attended: 0, class_id: cls._id };
                                attendanceStats[key].total += 1;
                                if (isPresent) attendanceStats[key].attended += 1;
                            }
                        }
                    }
                }
            }

            // 9. Update Attendance Summary
            console.log("Updating Attendance Summaries...");
            for (const key in attendanceStats) {
                const [student_id, subject_id] = key.split("_");
                const { total, attended, class_id } = attendanceStats[key];
                const percentage = (attended / total) * 100;

                await AttendanceSummary.findOneAndUpdate(
                    { student_id, subject_id },
                    { class_id, total_classes: total, attended_classes: attended, attendance_percentage: percentage, last_updated: new Date() },
                    { upsert: true, new: true }
                );
            }

            const endTime = Date.now();
            const duration = (endTime - startTime) / 1000;

            console.log("Seeding completed successfully in", duration, "seconds");
            res.json({
                success: true,
                message: "Extended historical data seeded successfully",
                details: {
                    departments: seededDepartments.length,
                    classes: seededClasses.length,
                    subjects: seededSubjects.length,
                    students: studentIds.length,
                    performance: {
                        duration: `${duration.toFixed(2)} seconds`
                    }
                }
            });

        } catch (error) {
            console.error("Seeding error:", error);
            next(error);
        }
    }
}
