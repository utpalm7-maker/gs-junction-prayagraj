/* =========================================================
   GS JUNCTION PRAYAGRAJ
   MASTER APP.JS
   10X THINK — COMPLETE + SAFE + SCALABLE VERSION

   BRAND:
   GS JUNCTION PRAYAGRAJ
   POWERED BY LIVE STUDY ALLAHABAD

   FEATURES:
   ---------------------------------------------------------
   • Dynamic Exam → Category → Subject → Test
   • tests/index.json support
   • 45 seconds per question
   • Automatic next question
   • Previous / Next navigation
   • Answer restore
   • Result calculation
   • Negative marking support
   • LocalStorage result history
   • TXT question upload
   • Multiple JSON structures supported
   • TGT / PGT / LT GRADE / GS etc. scalable
   • Safe HTML rendering
   • Mobile navigation
   • Admin / Student login
   • Cache-busting JSON loading
   • GitHub Pages compatible
========================================================= */

"use strict";


/* =========================================================
   GLOBAL STATE
========================================================= */

let testData = [];
let currentTest = null;

let currentQuestion = 0;

let score = 0;
let correctAnswers = 0;
let attempted = 0;
let wrongAnswers = 0;
let unanswered = 0;

let timerId = null;
let timeLeft = 0;

let selectedAnswers = [];

let currentExam = "";
let currentCategory = "";
let currentSubject = "";

let appInitialized = false;
let testSubmitted = false;

const SECONDS_PER_QUESTION = 45;

const TEST_INDEX_URL = "tests/index.json";

const RESULTS_STORAGE_KEY = "testResults";

const STUDENT_NAME_KEY = "studentName";

const USER_TYPE_KEY = "userType";


/* =========================================================
   DEFAULT EXAMS
========================================================= */

const DEFAULT_EXAMS = [
    "PCS",
    "UPSSSC",
    "TGT",
    "PGT",
    "LT GRADE",
    "UGC NET",
    "TET",
    "CTET"
];


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(id) {

    document
        .querySelectorAll(".page")
        .forEach(page => {

            page.classList.remove("active");

        });

    const page =
        document.getElementById(id);

    if (page) {

        page.classList.add("active");

    }

    const nav =
        document.getElementById("nav");

    if (nav) {

        nav.classList.remove("open");

    }

    window.scrollTo(0, 0);
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function toggleNav() {

    const nav =
        document.getElementById("nav");

    if (nav) {

        nav.classList.toggle("open");

    }
}


/* =========================================================
   STUDENT LOGIN
========================================================= */

function loginStudent() {

    localStorage.setItem(
        USER_TYPE_KEY,
        "student"
    );

    if (
        !localStorage.getItem(
            STUDENT_NAME_KEY
        )
    ) {

        localStorage.setItem(
            STUDENT_NAME_KEY,
            "Student"
        );

    }

    showPage("home");

    loadProfile();
}


/* =========================================================
   ADMIN LOGIN
========================================================= */

function loginAdmin() {

    const password =
        prompt(
            "Admin Password दर्ज करें:"
        );

    if (password === "admin123") {

        localStorage.setItem(
            USER_TYPE_KEY,
            "admin"
        );

        showPage("adminPanel");

    } else {

        alert(
            "गलत Admin Password।"
        );

    }
}


/* =========================================================
   LOGOUT
========================================================= */

function logout() {

    stopTimer();

    currentTest = null;

    selectedAnswers = [];

    currentQuestion = 0;

    score = 0;

    correctAnswers = 0;

    attempted = 0;

    wrongAnswers = 0;

    unanswered = 0;

    testSubmitted = false;

    localStorage.removeItem(
        USER_TYPE_KEY
    );

    showPage("loginPage");
}


/* =========================================================
   YOUTUBE
========================================================= */

function youtube() {

    window.open(
        "https://www.youtube.com/@LiveStudyAllahabad",
        "_blank",
        "noopener,noreferrer"
    );
}


/* =========================================================
   CONTACT
========================================================= */

function contactAdmin() {

    alert(
        "Course एवं अन्य जानकारी के लिए Live Study Allahabad से संपर्क करें।"
    );
}


/* =========================================================
   OPEN EXAM
========================================================= */

function openExam(exam) {

    currentExam = exam;

    const title =
        document.getElementById(
            "examTitle"
        );

    const description =
        document.getElementById(
            "examDescription"
        );

    if (title) {

        title.textContent =
            exam + " — Test Series";

    }

    if (description) {

        description.textContent =
            exam +
            " के लिए उपलब्ध सभी Tests";

    }

    renderExamTests(exam);

    showPage("examArea");
}


/* =========================================================
   GET TESTS BY EXAM
========================================================= */

function getTestsByExam(exam) {

    return testData.filter(
        test =>
            normalizeText(test.exam) ===
            normalizeText(exam)
    );
}


/* =========================================================
   EXAM TEST DISPLAY
========================================================= */

function renderExamTests(exam) {

    const container =
        document.getElementById(
            "examTests"
        );

    if (!container) return;

    container.innerHTML = "";

    const filtered =
        getTestsByExam(exam);

    if (!filtered.length) {

        container.innerHTML = `
            <div class="empty-state">

                <span>📝</span>

                <h3>
                    अभी कोई Test उपलब्ध नहीं है
                </h3>

                <p>
                    इस परीक्षा के लिए Test जल्द उपलब्ध कराया जाएगा।
                </p>

            </div>
        `;

        return;
    }

    filtered.forEach(
        (test, index) => {

            const button =
                document.createElement(
                    "button"
                );

            button.className =
                "dashboard-card";

            button.type =
                "button";

            const questionCount =
                Array.isArray(test.questions)
                    ? test.questions.length
                    : 0;

            const totalSeconds =
                questionCount *
                getSecondsPerQuestion(test);

            button.innerHTML = `
                <span>📝</span>

                <strong>
                    ${escapeHTML(
                        test.title ||
                        `Test - ${index + 1}`
                    )}
                </strong>

                <small>
                    ${questionCount} प्रश्न
                    •
                    ${formatTime(totalSeconds)}
                </small>
            `;

            button.onclick =
                function () {

                    startTestDirect(test);

                };

            container.appendChild(
                button
            );
        }
    );
}


/* =========================================================
   START TEST DIRECTLY
========================================================= */

function startTestDirect(test) {

    if (
        !test ||
        !Array.isArray(test.questions) ||
        !test.questions.length
    ) {

        alert(
            "इस Test में अभी कोई प्रश्न उपलब्ध नहीं है।"
        );

        return;
    }

    stopTimer();

    currentTest =
        normalizeTest(test);

    currentQuestion = 0;

    score = 0;

    correctAnswers = 0;

    attempted = 0;

    wrongAnswers = 0;

    unanswered = 0;

    testSubmitted = false;

    selectedAnswers =
        new Array(
            currentTest.questions.length
        ).fill(null);

    const resultArea =
        document.querySelector(
            "#tests #resultArea"
        );

    if (resultArea) {

        resultArea.classList.add(
            "hidden"
        );

        resultArea.innerHTML = "";

    }

    const testArea =
        document.getElementById(
            "testArea"
        );

    if (testArea) {

        testArea.classList.remove(
            "hidden"
        );

    }

    showPage("tests");

    renderTestArea();

    startQuestionTimer();
}


/* =========================================================
   TEST SELECTOR INITIALIZATION
========================================================= */

function initializeTestSelectors() {

    populateExamSelector();

    const count =
        document.getElementById(
            "count"
        );

    if (count) {

        count.innerHTML = "";

        [10, 20, 30, 50, 100].forEach(
            num => {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    String(num);

                option.textContent =
                    `${num} Questions`;

                count.appendChild(
                    option
                );

            }
        );

        if (testData.length) {

            count.value =
                String(
                    Math.min(
                        10,
                        getMaximumQuestionCount()
                    )
                );

        }
    }
}


/* =========================================================
   EXAM SELECTOR
========================================================= */

function populateExamSelector() {

    const select =
        document.getElementById(
            "examSelect"
        );

    if (!select) return;

    select.innerHTML =
        `<option value="">सभी Exams</option>`;

    const exams =
        getUniqueValues(
            testData.map(
                test => test.exam
            )
        );

    const finalExams =
        exams.length
            ? exams
            : DEFAULT_EXAMS;

    finalExams.forEach(
        exam => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                exam;

            option.textContent =
                exam;

            select.appendChild(
                option
            );

        }
    );
}


/* =========================================================
   CATEGORY SELECTOR
========================================================= */

function updateCategorySelector() {

    const exam =
        document.getElementById(
            "examSelect"
        )?.value || "";

    currentExam = exam;

    const select =
        document.getElementById(
            "categorySelect"
        );

    if (!select) return;

    select.innerHTML =
        `<option value="">सभी Categories</option>`;

    let tests =
        testData;

    if (exam) {

        tests =
            tests.filter(
                test =>
                    normalizeText(
                        test.exam
                    ) ===
                    normalizeText(
                        exam
                    )
            );

    }

    const categories =
        getUniqueValues(
            tests.map(
                test => test.category
            )
        );

    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                category;

            select.appendChild(
                option
            );

        }
    );

    updateSubjectSelector();
}


/* =========================================================
   SUBJECT SELECTOR
========================================================= */

function updateSubjectSelector() {

    const exam =
        document.getElementById(
            "examSelect"
        )?.value || "";

    const category =
        document.getElementById(
            "categorySelect"
        )?.value || "";

    currentExam =
        exam;

    currentCategory =
        category;

    const select =
        document.getElementById(
            "subjectSelect"
        );

    if (!select) return;

    select.innerHTML =
        `<option value="">सभी Subjects</option>`;

    let tests =
        testData;

    if (exam) {

        tests =
            tests.filter(
                test =>
                    normalizeText(
                        test.exam
                    ) ===
                    normalizeText(
                        exam
                    )
            );

    }

    if (category) {

        tests =
            tests.filter(
                test =>
                    normalizeText(
                        test.category
                    ) ===
                    normalizeText(
                        category
                    )
            );

    }

    const subjects =
        getUniqueValues(
            tests.map(
                test => test.subject
            )
        );

    subjects.forEach(
        subject => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                subject;

            option.textContent =
                subject;

            select.appendChild(
                option
            );

        }
    );

    updateTestSelector();
}


/* =========================================================
   TEST SELECTOR
========================================================= */

function updateTestSelector() {

    const exam =
        document.getElementById(
            "examSelect"
        )?.value || "";

    const category =
        document.getElementById(
            "categorySelect"
        )?.value || "";

    const subject =
        document.getElementById(
            "subjectSelect"
        )?.value || "";

    currentExam =
        exam;

    currentCategory =
        category;

    currentSubject =
        subject;

    const select =
        document.getElementById(
            "testSelect"
        );

    if (!select) return;

    select.innerHTML =
        `<option value="">Test चुनें</option>`;

    let tests =
        testData;

    if (exam) {

        tests =
            tests.filter(
                test =>
                    normalizeText(
                        test.exam
                    ) ===
                    normalizeText(
                        exam
                    )
            );

    }

    if (category) {

        tests =
            tests.filter(
                test =>
                    normalizeText(
                        test.category
                    ) ===
                    normalizeText(
                        category
                    )
            );

    }

    if (subject) {

        tests =
            tests.filter(
                test =>
                    normalizeText(
                        test.subject
                    ) ===
                    normalizeText(
                        subject
                    )
            );

    }

    tests.forEach(
        (test, index) => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                String(
                    testData.indexOf(
                        test
                    )
                );

            option.textContent =
                test.title ||
                `Test ${index + 1}`;

            select.appendChild(
                option
            );

        }
    );

    showSelectedTestInfo();
}


/* =========================================================
   SELECTED TEST INFO
========================================================= */

function showSelectedTestInfo() {

    const select =
        document.getElementById(
            "testSelect"
        );

    const info =
        document.getElementById(
            "selectedTestInfo"
        );

    if (!select || !info) return;

    const index =
        Number(select.value);

    if (
        select.value === "" ||
        !testData[index]
    ) {

        info.innerHTML =
            "Exam → Category → Subject → Test Select करें।";

        return;
    }

    const test =
        normalizeTest(
            testData[index]
        );

    const total =
        test.questions.length;

    const secondsPerQuestion =
        getSecondsPerQuestion(test);

    const totalTime =
        total *
        secondsPerQuestion;

    const negative =
        getNegativeMarking(test);

    info.innerHTML = `
        <strong>
            ${escapeHTML(
                test.title ||
                "Online Test"
            )}
        </strong>

        <br>

        Exam:
        ${escapeHTML(
            test.exam || "-"
        )}

        <br>

        Category:
        ${escapeHTML(
            test.category || "-"
        )}

        <br>

        Subject:
        ${escapeHTML(
            test.subject || "-"
        )}

        <br>

        प्रश्न:
        ${total}

        <br>

        प्रति प्रश्न:
        ${secondsPerQuestion} सेकंड

        <br>

        कुल समय:
        ${formatTime(totalTime)}

        ${
            negative > 0
                ? `
                    <br>
                    Negative Marking:
                    -${negative}
                `
                : ""
        }
    `;
}


/* =========================================================
   START SELECTED TEST
========================================================= */

function startTest() {

    const select =
        document.getElementById(
            "testSelect"
        );

    if (
        !select ||
        select.value === ""
    ) {

        alert(
            "कृपया पहले Test चुनें।"
        );

        return;
    }

    const index =
        Number(select.value);

    const test =
        testData[index];

    if (!test) {

        alert(
            "Test उपलब्ध नहीं है।"
        );

        return;
    }

    const countSelect =
        document.getElementById(
            "count"
        );

    let questionCount =
        Number(
            countSelect?.value || 0
        );

    const total =
        Array.isArray(test.questions)
            ? test.questions.length
            : 0;

    if (
        !questionCount ||
        questionCount > total
    ) {

        questionCount =
            total;

    }

    const clonedTest =
        JSON.parse(
            JSON.stringify(test)
        );

    clonedTest.questions =
        clonedTest.questions.slice(
            0,
            questionCount
        );

    startTestDirect(
        clonedTest
    );
}


/* =========================================================
   RENDER TEST AREA
========================================================= */

function renderTestArea() {

    const area =
        document.getElementById(
            "testArea"
        );

    if (
        !area ||
        !currentTest
    ) {

        return;
    }

    area.classList.remove(
        "hidden"
    );

    const q =
        currentTest.questions[
            currentQuestion
        ];

    if (!q) {

        finishTest();

        return;
    }

    const total =
        currentTest.questions.length;

    const secondsPerQuestion =
        getSecondsPerQuestion(
            currentTest
        );

    const answeredCount =
        selectedAnswers.filter(
            answer =>
                answer !== null &&
                answer !== undefined &&
                answer !== ""
        ).length;

    area.innerHTML = `

        <div class="test-header">

            <div>

                <strong>
                    ${escapeHTML(
                        currentTest.title ||
                        "Online Test"
                    )}
                </strong>

                <small>
                    प्रश्न
                    ${currentQuestion + 1}
                    /
                    ${total}
                </small>

                <small>
                    Attempted:
                    ${answeredCount}/${total}
                </small>

            </div>

            <div
                id="timer"
                class="test-timer">

                ${formatTime(
                    timeLeft
                )}

            </div>

        </div>


        <div class="question-card">

            <div class="question-number">
                प्रश्न
                ${currentQuestion + 1}
            </div>


            <h3 class="question-text">

                ${escapeHTML(
                    q.question ||
                    q.text ||
                    ""
                )}

            </h3>


            <div class="options">

                ${renderOptions(q)}

            </div>


            <div class="question-controls">

                ${
                    currentQuestion > 0
                    ? `
                        <button
                            type="button"
                            onclick="previousQuestion()">

                            ◀ पिछला

                        </button>
                    `
                    : ""
                }


                ${
                    currentQuestion <
                    total - 1
                    ? `
                        <button
                            type="button"
                            onclick="nextQuestion()">

                            अगला ▶

                        </button>
                    `
                    : `
                        <button
                            type="button"
                            onclick="finishTest()">

                            🏆 Test Submit करें

                        </button>
                    `
                }

            </div>


            <div class="test-progress">

                <span>
                    प्रश्न ${currentQuestion + 1}
                    / ${total}
                </span>

                <span>
                    ${secondsPerQuestion} सेकंड/प्रश्न
                </span>

            </div>

        </div>

    `;

    restoreSelectedAnswer();

    updateTimerDisplay();
}


/* =========================================================
   RENDER OPTIONS
========================================================= */

function renderOptions(question) {

    const options =
        getQuestionOptions(
            question
        );

    if (!options.length) {

        return `
            <p>
                इस प्रश्न के विकल्प उपलब्ध नहीं हैं।
            </p>
        `;
    }

    return options
        .map(
            (option, index) => {

                const letter =
                    String.fromCharCode(
                        65 + index
                    );

                return `

                    <label class="option">

                        <input
                            type="radio"
                            name="answer"
                            value="${letter}"
                            onchange="selectAnswer('${letter}')">

                        <span>

                            <strong>
                                (${letter})
                            </strong>

                            ${escapeHTML(
                                String(option)
                            )}

                        </span>

                    </label>

                `;

            }
        )
        .join("");
}


/* =========================================================
   SELECT ANSWER
========================================================= */

function selectAnswer(answer) {

    if (
        !currentTest ||
        !selectedAnswers
    ) {

        return;
    }

    selectedAnswers[
        currentQuestion
    ] =
        normalizeAnswer(
            answer
        );

    updateTestProgress();
}


/* =========================================================
   RESTORE ANSWER
========================================================= */

function restoreSelectedAnswer() {

    const answer =
        selectedAnswers[
            currentQuestion
        ];

    if (!answer) {

        return;
    }

    const input =
        document.querySelector(
            `input[name="answer"][value="${answer}"]`
        );

    if (input) {

        input.checked =
            true;
    }
}


/* =========================================================
   UPDATE TEST PROGRESS
========================================================= */

function updateTestProgress() {

    const progress =
        document.querySelector(
            ".test-progress"
        );

    if (!progress) return;

    const total =
        currentTest?.questions?.length || 0;

    const attemptedNow =
        selectedAnswers.filter(
            answer =>
                answer !== null &&
                answer !== undefined &&
                answer !== ""
        ).length;

    progress.innerHTML = `
        <span>
            प्रश्न ${currentQuestion + 1}
            / ${total}
        </span>

        <span>
            Attempted:
            ${attemptedNow}/${total}
        </span>
    `;
}


/* =========================================================
   NEXT QUESTION
========================================================= */

function nextQuestion() {

    if (!currentTest) {

        return;
    }

    saveCurrentAnswer();

    if (
        currentQuestion <
        currentTest.questions.length - 1
    ) {

        currentQuestion++;

        resetQuestionTimer();

        renderTestArea();

    } else {

        finishTest();

    }
}


/* =========================================================
   PREVIOUS QUESTION
========================================================= */

function previousQuestion() {

    if (!currentTest) {

        return;
    }

    saveCurrentAnswer();

    if (currentQuestion > 0) {

        currentQuestion--;

        resetQuestionTimer();

        renderTestArea();

    }
}


/* =========================================================
   SAVE CURRENT ANSWER
========================================================= */

function saveCurrentAnswer() {

    if (!currentTest) {

        return;
    }

    const selected =
        document.querySelector(
            'input[name="answer"]:checked'
        );

    if (selected) {

        selectedAnswers[
            currentQuestion
        ] =
            normalizeAnswer(
                selected.value
            );

    }
}


/* =========================================================
   TIMER
   EXACTLY 45 SECONDS PER QUESTION
========================================================= */

function startQuestionTimer() {

    stopTimer();

    if (!currentTest) {

        return;
    }

    timeLeft =
        getSecondsPerQuestion(
            currentTest
        );

    updateTimerDisplay();

    timerId =
        setInterval(
            function () {

                timeLeft--;

                updateTimerDisplay();

                if (
                    timeLeft <= 0
                ) {

                    stopTimer();

                    autoNextQuestion();

                }

            },
            1000
        );
}


/* =========================================================
   RESET QUESTION TIMER
========================================================= */

function resetQuestionTimer() {

    stopTimer();

    timeLeft =
        getSecondsPerQuestion(
            currentTest
        );

    updateTimerDisplay();

    startQuestionTimer();
}


/* =========================================================
   STOP TIMER
========================================================= */

function stopTimer() {

    if (
        timerId !== null
    ) {

        clearInterval(
            timerId
        );

        timerId = null;
    }
}


/* =========================================================
   TIMER DISPLAY
========================================================= */

function updateTimerDisplay() {

    const timer =
        document.getElementById(
            "timer"
        );

    if (!timer) {

        return;
    }

    timer.textContent =
        formatTime(
            timeLeft
        );

    timer.classList.remove(
        "warning",
        "danger"
    );

    if (
        timeLeft <= 10
    ) {

        timer.classList.add(
            "danger"
        );

    } else if (
        timeLeft <= 20
    ) {

        timer.classList.add(
            "warning"
        );

    }
}


/* =========================================================
   AUTO NEXT QUESTION
========================================================= */

function autoNextQuestion() {

    if (!currentTest) {

        return;
    }

    saveCurrentAnswer();

    if (
        currentQuestion <
        currentTest.questions.length - 1
    ) {

        currentQuestion++;

        timeLeft =
            getSecondsPerQuestion(
                currentTest
            );

        renderTestArea();

        startQuestionTimer();

    } else {

        finishTest();

    }
}


/* =========================================================
   FINISH TEST
========================================================= */

function finishTest() {

    if (testSubmitted) {

        return;
    }

    stopTimer();

    saveCurrentAnswer();

    if (!currentTest) {

        return;
    }

    testSubmitted = true;

    const questions =
        currentTest.questions || [];

    let correct = 0;

    let attemptedCount = 0;

    let wrong = 0;

    let unansweredCount = 0;

    let marks = 0;

    const positiveMark =
        getPositiveMarking(
            currentTest
        );

    const negativeMark =
        getNegativeMarking(
            currentTest
        );

    questions.forEach(
        (question, index) => {

            const userAnswer =
                normalizeAnswer(
                    selectedAnswers[index]
                );

            const correctAnswer =
                getCorrectAnswer(
                    question
                );

            if (userAnswer) {

                attemptedCount++;

                if (
                    userAnswer ===
                    correctAnswer
                ) {

                    correct++;

                    marks +=
                        positiveMark;

                } else {

                    wrong++;

                    marks -=
                        negativeMark;

                }

            } else {

                unansweredCount++;

            }

        }
    );

    correctAnswers =
        correct;

    attempted =
        attemptedCount;

    wrongAnswers =
        wrong;

    unanswered =
        unansweredCount;

    score =
        marks;

    const total =
        questions.length;

    const percentage =
        total > 0
            ? Math.round(
                (
                    correct /
                    total
                ) * 100
            )
            : 0;

    const result = {

        title:
            currentTest.title ||
            "Online Test",

        exam:
            currentTest.exam ||
            "",

        category:
            currentTest.category ||
            "",

        subject:
            currentTest.subject ||
            "",

        total,

        correct,

        wrong,

        unanswered:
            unansweredCount,

        attempted:
            attemptedCount,

        marks,

        positiveMark,

        negativeMark,

        percentage,

        date:
            new Date().toISOString()

    };

    saveResult(result);

    showResult(result);
}


/* =========================================================
   SHOW RESULT
========================================================= */

function showResult(result) {

    stopTimer();

    const area =
        document.getElementById(
            "testArea"
        );

    if (area) {

        area.classList.add(
            "hidden"
        );

    }

    const resultArea =
        document.querySelector(
            "#tests #resultArea"
        );

    if (!resultArea) {

        return;
    }

    resultArea.classList.remove(
        "hidden"
    );

    const negativeText =
        Number(result.negativeMark || 0) > 0
            ? `
                <div>
                    <strong>
                        ${Number(
                            result.negativeMark
                        )}
                    </strong>
                    <span>
                        Negative Mark
                    </span>
                </div>
            `
            : "";

    resultArea.innerHTML = `

        <div class="result-card">

            <h2>
                🏆 Test Result
            </h2>

            <h3>
                ${escapeHTML(
                    currentTest?.title ||
                    "Online Test"
                )}
            </h3>


            <div class="result-stats">

                <div>

                    <strong>
                        ${result.total}
                    </strong>

                    <span>
                        कुल प्रश्न
                    </span>

                </div>


                <div>

                    <strong>
                        ${result.correct}
                    </strong>

                    <span>
                        सही
                    </span>

                </div>


                <div>

                    <strong>
                        ${result.wrong}
                    </strong>

                    <span>
                        गलत
                    </span>

                </div>


                <div>

                    <strong>
                        ${result.unanswered}
                    </strong>

                    <span>
                        अनुत्तरित
                    </span>

                </div>


                <div>

                    <strong>
                        ${result.attempted}
                    </strong>

                    <span>
                        Attempted
                    </span>

                </div>


                <div>

                    <strong>
                        ${result.percentage}%
                    </strong>

                    <span>
                        प्रतिशत
                    </span>

                </div>

                ${negativeText}

            </div>


            <div class="result-score">

                <strong>
                    Score:
                    ${formatMarks(result.marks)}
                </strong>

            </div>


            <div class="result-actions">

                <button
                    type="button"
                    onclick="showResults()">

                    📊 सभी Results

                </button>


                <button
                    type="button"
                    onclick="showPage('home')">

                    🏠 Home

                </button>

            </div>

        </div>

    `;

    showPage("tests");
}


/* =========================================================
   SAVE RESULT
========================================================= */

function saveResult(result) {

    const results =
        getResults();

    results.push(result);

    const limitedResults =
        results.slice(-500);

    try {

        localStorage.setItem(
            RESULTS_STORAGE_KEY,
            JSON.stringify(
                limitedResults
            )
        );

    } catch (error) {

        console.warn(
            "Result save नहीं हुआ:",
            error
        );

    }
}


/* =========================================================
   GET RESULTS
========================================================= */

function getResults() {

    try {

        const data =
            JSON.parse(
                localStorage.getItem(
                    RESULTS_STORAGE_KEY
                )
            );

        return Array.isArray(data)
            ? data
            : [];

    } catch (error) {

        return [];
    }
}


/* =========================================================
   SHOW ALL RESULTS
========================================================= */

function showResults() {

    const area =
        document.querySelector(
            "#results #resultArea"
        );

    if (!area) {

        return;
    }

    const results =
        getResults();

    if (!results.length) {

        area.innerHTML = `

            <div class="empty-state">

                <span>🏆</span>

                <h3>
                    अभी कोई Result उपलब्ध नहीं है
                </h3>

                <p>
                    Test देने के बाद आपका Result यहाँ दिखाई देगा।
                </p>

            </div>

        `;

        showPage("results");

        return;
    }

    area.innerHTML = `

        <div class="results-list">

            ${results
                .slice()
                .reverse()
                .map(
                    result => `

                    <div class="result-item">

                        <h3>
                            ${escapeHTML(
                                result.title ||
                                "Online Test"
                            )}
                        </h3>

                        <p>

                            ${escapeHTML(
                                result.exam ||
                                ""
                            )}

                            ${
                                result.category
                                    ? " • " +
                                      escapeHTML(
                                          result.category
                                      )
                                    : ""
                            }

                            ${
                                result.subject
                                    ? " • " +
                                      escapeHTML(
                                          result.subject
                                      )
                                    : ""
                            }

                        </p>


                        <div class="result-row">

                            <span>
                                कुल:
                                ${Number(
                                    result.total || 0
                                )}
                            </span>

                            <span>
                                सही:
                                ${Number(
                                    result.correct || 0
                                )}
                            </span>

                            <span>
                                गलत:
                                ${Number(
                                    result.wrong || 0
                                )}
                            </span>

                            <span>
                                अनुत्तरित:
                                ${Number(
                                    result.unanswered || 0
                                )}
                            </span>

                            <strong>
                                ${Number(
                                    result.percentage || 0
                                )}%
                            </strong>

                        </div>


                        ${
                            result.marks !== undefined
                                ? `
                                    <div>
                                        Score:
                                        ${formatMarks(
                                            result.marks
                                        )}
                                    </div>
                                `
                                : ""
                        }


                        <small>
                            ${formatDate(
                                result.date
                            )}
                        </small>

                    </div>

                `
                )
                .join("")}

        </div>

    `;

    showPage("results");
}


/* =========================================================
   PROFILE
========================================================= */

function loadProfile() {

    const name =
        localStorage.getItem(
            STUDENT_NAME_KEY
        ) ||
        "Student";

    const studentName =
        document.getElementById(
            "studentName"
        );

    const nameInput =
        document.getElementById(
            "name"
        );

    if (studentName) {

        studentName.textContent =
            name;

    }

    if (nameInput) {

        nameInput.value =
            name === "Student"
                ? ""
                : name;

    }

    const results =
        getResults();

    const totalTests =
        results.length;

    let bestScore = 0;

    let totalQuestions = 0;

    let totalCorrect = 0;

    results.forEach(
        result => {

            bestScore =
                Math.max(
                    bestScore,
                    Number(
                        result.percentage || 0
                    )
                );

            totalQuestions +=
                Number(
                    result.total || 0
                );

            totalCorrect +=
                Number(
                    result.correct || 0
                );

        }
    );

    const accuracy =
        totalQuestions > 0
            ? Math.round(
                (
                    totalCorrect /
                    totalQuestions
                ) * 100
            )
            : 0;

    const totalTestsElement =
        document.getElementById(
            "totalTests"
        );

    const bestScoreElement =
        document.getElementById(
            "bestScore"
        );

    const accuracyElement =
        document.getElementById(
            "accuracy"
        );

    if (totalTestsElement) {

        totalTestsElement.textContent =
            totalTests;

    }

    if (bestScoreElement) {

        bestScoreElement.textContent =
            bestScore + "%";

    }

    if (accuracyElement) {

        accuracyElement.textContent =
            accuracy + "%";

    }
}


/* =========================================================
   SAVE NAME
========================================================= */

function saveName() {

    const input =
        document.getElementById(
            "name"
        );

    const msg =
        document.getElementById(
            "msg"
        );

    if (!input) {

        return;
    }

    const name =
        input.value.trim();

    if (!name) {

        if (msg) {

            msg.textContent =
                "कृपया अपना नाम लिखें।";

        }

        return;
    }

    localStorage.setItem(
        STUDENT_NAME_KEY,
        name
    );

    const studentName =
        document.getElementById(
            "studentName"
        );

    if (studentName) {

        studentName.textContent =
            name;

    }

    if (msg) {

        msg.textContent =
            "✅ नाम सुरक्षित हो गया।";

    }
}


/* =========================================================
   ADMIN ACTION
========================================================= */

function adminAction(type) {

    const messages = {

        tests:
            "Test Management module जल्द activate किया जाएगा।",

        questions:
            "Question Bank module जल्द activate किया जाएगा।",

        students:
            "Student Management module जल्द activate किया जाएगा।",

        notes:
            "Notes / PDF Management module जल्द activate किया जाएगा।",

        notifications:
            "Notification Management module जल्द activate किया जाएगा।",

        links:
            "Social Links Management module जल्द activate किया जाएगा।",

        courses:
            "Course Management module जल्द activate किया जाएगा।",

        settings:
            "App Settings module जल्द activate किया जाएगा।"

    };

    const message =
        messages[type] ||
        "Admin module जल्द activate किया जाएगा।";

    const adminMessage =
        document.getElementById(
            "adminMessage"
        );

    if (adminMessage) {

        adminMessage.classList.remove(
            "hidden"
        );

        adminMessage.innerHTML = `

            <h3>
                ⚙️ Admin Module
            </h3>

            <p>
                ${escapeHTML(
                    message
                )}
            </p>

        `;

    } else {

        alert(message);

    }
}


/* =========================================================
   TXT FILE UPLOAD
========================================================= */

function initializeTXTUpload() {

    const input =
        document.getElementById(
            "txtFile"
        );

    if (!input) {

        return;
    }

    if (
        input.dataset.initialized === "true"
    ) {

        return;
    }

    input.dataset.initialized =
        "true";

    input.addEventListener(
        "change",
        function(event) {

            const file =
                event.target.files[0];

            if (!file) {

                return;
            }

            const reader =
                new FileReader();

            reader.onload =
                function(e) {

                    const text =
                        e.target.result;

                    const questions =
                        parseTXTQuestions(
                            text
                        );

                    if (!questions.length) {

                        alert(
                            "TXT file में प्रश्न नहीं मिले।"
                        );

                        return;
                    }

                    const test = {

                        id:
                            "txt-" +
                            Date.now(),

                        title:
                            file.name.replace(
                                /\.txt$/i,
                                ""
                            ),

                        exam:
                            "TXT Test",

                        category:
                            "Uploaded",

                        subject:
                            "General Studies",

                        questions:
                            questions

                    };

                    testData.push(
                        normalizeTest(
                            test
                        )
                    );

                    alert(
                        questions.length +
                        " प्रश्न successfully load हो गए।"
                    );

                    populateExamSelector();

                    updateCategorySelector();

                    renderHomeExamGrid();

                    renderExamTests(
                        "TXT Test"
                    );

                };

            reader.onerror =
                function() {

                    alert(
                        "TXT file पढ़ने में समस्या हुई।"
                    );

                };

            reader.readAsText(
                file,
                "UTF-8"
            );

        }
    );
}


/* =========================================================
   PARSE TXT QUESTIONS
========================================================= */

function parseTXTQuestions(text) {

    if (
        !text ||
        typeof text !== "string"
    ) {

        return [];
    }

    const normalizedText =
        text.replace(
            /\r\n/g,
            "\n"
        );

    const blocks =
        normalizedText
            .split(/\n\s*\n/)
            .map(
                block =>
                    block.trim()
            )
            .filter(Boolean);

    const questions = [];

    blocks.forEach(
        block => {

            const lines =
                block
                    .split("\n")
                    .map(
                        line =>
                            line.trim()
                    )
                    .filter(Boolean);

            if (!lines.length) {

                return;
            }

            let questionText = "";

            const options = [];

            let answer = "";

            lines.forEach(
                line => {

                    if (
                        /^[\(\[]?[A-Da-d][\)\].:-]\s*/.test(
                            line
                        )
                    ) {

                        options.push(
                            line.replace(
                                /^[\(\[]?[A-Da-d][\)\].:-]\s*/,
                                ""
                            ).trim()
                        );

                    } else if (
                        /^(उत्तर|answer|ans|correct)\s*[:\-]/i.test(
                            line
                        )
                    ) {

                        answer =
                            line.replace(
                                /^(उत्तर|answer|ans|correct)\s*[:\-]\s*/i,
                                ""
                            )
                            .trim();

                    } else {

                        questionText +=
                            (
                                questionText
                                    ? " "
                                    : ""
                            ) +
                            line;

                    }

                }
            );

            if (
                questionText &&
                options.length >= 2
            ) {

                questions.push({

                    question:
                        questionText,

                    options:
                        options,

                    answer:
                        normalizeAnswer(
                            answer
                        )

                });

            }

        }
    );

    return questions;
}


/* =========================================================
   LOAD TEST INDEX
========================================================= */

async function loadTests() {

    try {

        const controller =
            new AbortController();

        const timeout =
            setTimeout(
                function() {

                    controller.abort();

                },
                8000
            );

        const response =
            await fetch(
                TEST_INDEX_URL +
                "?v=" +
                Date.now(),
                {
                    cache:
                        "no-store",

                    signal:
                        controller.signal
                }
            );

        clearTimeout(
            timeout
        );

        if (!response.ok) {

            throw new Error(
                "Index file not found: " +
                response.status
            );

        }

        const data =
            await response.json();

        testData =
            normalizeTestData(
                data
            );

        console.log(
            "✅ Tests Loaded:",
            testData.length
        );

    } catch (error) {

        console.error(
            "❌ tests/index.json loading error:",
            error
        );

        testData = [];

    }

    initializeTestSelectors();

    renderHomeExamGrid();

    return testData;
}


/* =========================================================
   NORMALIZE TEST DATA
========================================================= */

function normalizeTestData(data) {

    let tests = [];

    if (Array.isArray(data)) {

        tests =
            data;

    } else if (
        data &&
        Array.isArray(data.tests)
    ) {

        tests =
            data.tests;

    } else if (
        data &&
        Array.isArray(data.data)
    ) {

        tests =
            data.data;

    } else if (
        data &&
        Array.isArray(data.testData)
    ) {

        tests =
            data.testData;

    } else if (
        data &&
        typeof data === "object"
    ) {

        Object.keys(data)
            .forEach(
                key => {

                    if (
                        Array.isArray(
                            data[key]
                        )
                    ) {

                        data[key].forEach(
                            test => {

                                if (
                                    test &&
                                    typeof test === "object"
                                ) {

                                    tests.push({

                                        ...test,

                                        exam:
                                            test.exam ||
                                            key

                                    });

                                }

                            }
                        );

                    }

                }
            );
    }

    return tests.map(
        normalizeTest
    );
}


/* =========================================================
   NORMALIZE TEST
========================================================= */

function normalizeTest(test) {

    if (
        !test ||
        typeof test !== "object"
    ) {

        return {

            id:
                "test-" +
                Date.now(),

            title:
                "Online Test",

            exam:
                "",

            category:
                "General",

            subject:
                "General Studies",

            questions:
                [],

            timePerQuestion:
                SECONDS_PER_QUESTION,

            marksPerQuestion:
                1,

            negativeMarking:
                0

        };
    }

    const normalized = {
        ...test
    };

    normalized.id =
        test.id ||
        test.testId ||
        test.slug ||
        (
            "test-" +
            Math.random()
                .toString(36)
                .slice(2)
        );

    normalized.questions =
        Array.isArray(
            test.questions
        )
            ? test.questions.map(
                normalizeQuestion
            )
            : [];

    normalized.exam =
        test.exam ||
        test.examName ||
        "";

    normalized.category =
        test.category ||
        test.type ||
        "General";

    normalized.subject =
        test.subject ||
        test.subjectName ||
        "General Studies";

    normalized.title =
        test.title ||
        test.name ||
        "Online Test";

    normalized.timePerQuestion =
        getNumberFromObject(
            test,
            [
                "timePerQuestion",
                "secondsPerQuestion",
                "questionTime",
                "time_per_question"
            ],
            SECONDS_PER_QUESTION
        );

    normalized.marksPerQuestion =
        getNumberFromObject(
            test,
            [
                "marksPerQuestion",
                "marks",
                "markPerQuestion",
                "positiveMark"
            ],
            1
        );

    normalized.negativeMarking =
        getNumberFromObject(
            test,
            [
                "negativeMarking",
                "negativeMarks",
                "negativeMark",
                "minusMarks"
            ],
            0
        );

    return normalized;
}


/* =========================================================
   NORMALIZE QUESTION
========================================================= */

function normalizeQuestion(question) {

    if (
        !question ||
        typeof question !== "object"
    ) {

        return {

            question:
                "",

            options:
                [],

            answer:
                ""

        };
    }

    const q = {
        ...question
    };

    q.question =
        q.question ||
        q.text ||
        q.q ||
        q.questionText ||
        "";

    q.options =
        getQuestionOptions(
            q
        );

    q.answer =
        normalizeAnswer(
            q.answer ??
            q.correct ??
            q.correctAnswer ??
            q.correct_option ??
            q.correctOption ??
            q.key ??
            ""
        );

    return q;
}


/* =========================================================
   GET QUESTION OPTIONS
========================================================= */

function getQuestionOptions(
    question
) {

    if (
        !question ||
        typeof question !== "object"
    ) {

        return [];
    }

    if (
        Array.isArray(
            question.options
        )
    ) {

        return question.options;
    }

    if (
        Array.isArray(
            question.choices
        )
    ) {

        return question.choices;
    }

    if (
        Array.isArray(
            question.answers
        )
    ) {

        return question.answers;
    }

    const options = [];

    [
        "A",
        "B",
        "C",
        "D"
    ].forEach(
        letter => {

            const value =
                question[
                    "option" +
                    letter
                ];

            if (
                value !== undefined &&
                value !== null &&
                value !== ""
            ) {

                options.push(
                    value
                );

            }

        }
    );

    return options;
}


/* =========================================================
   GET CORRECT ANSWER
========================================================= */

function getCorrectAnswer(
    question
) {

    if (
        !question ||
        typeof question !== "object"
    ) {

        return "";
    }

    const answer =
        question.answer ??
        question.correct ??
        question.correctAnswer ??
        question.correct_option ??
        question.correctOption ??
        question.key ??
        "";

    return normalizeAnswer(
        answer
    );
}


/* =========================================================
   NORMALIZE ANSWER
========================================================= */

function normalizeAnswer(
    answer
) {

    if (
        answer === null ||
        answer === undefined
    ) {

        return "";
    }

    let value =
        String(answer)
            .trim()
            .toUpperCase();

    value =
        value
            .replace(
                /^[\(\[]/,
                ""
            )
            .replace(
                /[\)\].:]$/,
                ""
            )
            .trim();

    if (
        [
            "A",
            "B",
            "C",
            "D"
        ].includes(value)
    ) {

        return value;
    }

    /*
     * 0 / 1 / 2 / 3
     */
    if (
        /^\d+$/.test(value)
    ) {

        const num =
            Number(value);

        if (
            num >= 0 &&
            num <= 3
        ) {

            return String.fromCharCode(
                65 + num
            );
        }

        /*
         * 1 / 2 / 3 / 4
         */
        if (
            num >= 1 &&
            num <= 4
        ) {

            return String.fromCharCode(
                64 + num
            );
        }

    }

    const first =
        value.charAt(0);

    if (
        [
            "A",
            "B",
            "C",
            "D"
        ].includes(first)
    ) {

        return first;
    }

    return value;
}


/* =========================================================
   GET SECONDS PER QUESTION
========================================================= */

function getSecondsPerQuestion(test) {

    const value =
        Number(
            test?.timePerQuestion
        );

    if (
        Number.isFinite(value) &&
        value > 0
    ) {

        return Math.round(value);
    }

    return SECONDS_PER_QUESTION;
}


/* =========================================================
   GET POSITIVE MARKING
========================================================= */

function getPositiveMarking(test) {

    const value =
        Number(
            test?.marksPerQuestion
        );

    if (
        Number.isFinite(value) &&
        value >= 0
    ) {

        return value;
    }

    return 1;
}


/* =========================================================
   GET NEGATIVE MARKING
========================================================= */

function getNegativeMarking(test) {

    const value =
        Number(
            test?.negativeMarking
        );

    if (
        Number.isFinite(value) &&
        value >= 0
    ) {

        return value;
    }

    return 0;
}


/* =========================================================
   GET NUMBER FROM OBJECT
========================================================= */

function getNumberFromObject(
    object,
    keys,
    fallback
) {

    if (
        !object ||
        typeof object !== "object"
    ) {

        return fallback;
    }

    for (
        const key of keys
    ) {

        if (
            object[key] !== undefined &&
            object[key] !== null &&
            object[key] !== ""
        ) {

            const value =
                Number(
                    object[key]
                );

            if (
                Number.isFinite(value)
            ) {

                return value;
            }

        }
    }

    return fallback;
}


/* =========================================================
   HOME EXAM GRID
========================================================= */

function renderHomeExamGrid() {

    const grid =
        document.getElementById(
            "homeExamGrid"
        );

    if (!grid) {

        return;
    }

    grid.innerHTML = "";

    const exams =
        getUniqueValues(
            testData.map(
                test => test.exam
            )
        );

    const finalExams =
        exams.length
            ? exams
            : DEFAULT_EXAMS;

    finalExams.forEach(
        exam => {

            const button =
                document.createElement(
                    "button"
                );

            button.type =
                "button";

            button.innerHTML = `

                <strong>
                    ${escapeHTML(
                        exam
                    )}
                </strong>

                <span>
                    Test Series
                </span>

            `;

            button.onclick =
                function() {

                    openExam(
                        exam
                    );

                };

            grid.appendChild(
                button
            );

        }
    );
}


/* =========================================================
   UNIQUE VALUES
========================================================= */

function getUniqueValues(
    values
) {

    return [
        ...new Set(
            values
                .filter(Boolean)
                .map(
                    value =>
                        String(
                            value
                        ).trim()
                )
                .filter(Boolean)
        )
    ];
}


/* =========================================================
   NORMALIZE TEXT
========================================================= */

function normalizeText(
    value
) {

    return String(
        value || ""
    )
        .trim()
        .toLowerCase();
}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatTime(
    seconds
) {

    seconds =
        Math.max(
            0,
            Number(seconds) || 0
        );

    const minutes =
        Math.floor(
            seconds / 60
        );

    const secs =
        seconds % 60;

    return (
        String(
            minutes
        ).padStart(
            2,
            "0"
        ) +
        ":" +
        String(
            secs
        ).padStart(
            2,
            "0"
        )
    );
}


/* =========================================================
   FORMAT MARKS
========================================================= */

function formatMarks(
    marks
) {

    const number =
        Number(marks);

    if (
        !Number.isFinite(number)
    ) {

        return "0";
    }

    return Number.isInteger(number)
        ? String(number)
        : number.toFixed(2);
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(
    date
) {

    if (!date) {

        return "";
    }

    try {

        return new Date(
            date
        ).toLocaleString(
            "hi-IN"
        );

    } catch (error) {

        return "";
    }
}


/* =========================================================
   MAXIMUM QUESTION COUNT
========================================================= */

function getMaximumQuestionCount() {

    if (!testData.length) {

        return 0;
    }

    return Math.max(
        ...testData.map(
            test =>
                Array.isArray(
                    test.questions
                )
                    ? test.questions.length
                    : 0
        )
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   RESET CURRENT TEST
========================================================= */

function resetCurrentTest() {

    stopTimer();

    currentTest = null;

    currentQuestion = 0;

    selectedAnswers = [];

    score = 0;

    correctAnswers = 0;

    attempted = 0;

    wrongAnswers = 0;

    unanswered = 0;

    testSubmitted = false;

    timeLeft = 0;
}


/* =========================================================
   APPLICATION START
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function() {

        if (appInitialized) {

            return;
        }

        appInitialized =
            true;

        const userType =
            localStorage.getItem(
                USER_TYPE_KEY
            );

        if (
            userType === "admin"
        ) {

            showPage(
                "adminPanel"
            );

        } else if (
            userType === "student"
        ) {

            showPage(
                "home"
            );

        } else {

            showPage(
                "loginPage"
            );

        }

        loadProfile();

        initializeTXTUpload();

        loadTests();

    }
);


/* =========================================================
   SELECTOR EVENT FALLBACK
   HTML में onchange न हो तो भी काम करेगा
========================================================= */

document.addEventListener(
    "change",
    function(event) {

        const id =
            event.target?.id;

        if (
            id === "examSelect"
        ) {

            updateCategorySelector();

        }

        if (
            id === "categorySelect"
        ) {

            updateSubjectSelector();

        }

        if (
            id === "subjectSelect"
        ) {

            updateTestSelector();

        }

        if (
            id === "testSelect"
        ) {

            showSelectedTestInfo();

        }

    }
);


/* =========================================================
   PREVENT ACCIDENTAL PAGE REFRESH
   DURING ACTIVE TEST
========================================================= */

window.addEventListener(
    "beforeunload",
    function(event) {

        if (
            currentTest &&
            timerId !== null &&
            !testSubmitted
        ) {

            event.preventDefault();

            event.returnValue = "";

        }

    }
);


/* =========================================================
   KEYBOARD SUPPORT
   ---------------------------------------------------------
   ← Previous
   → Next
   1-4 Select Answer
========================================================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            !currentTest ||
            testSubmitted
        ) {

            return;
        }

        const tag =
            document.activeElement?.tagName;

        if (
            tag === "INPUT" ||
            tag === "TEXTAREA" ||
            tag === "SELECT"
        ) {

            return;
        }

        if (
            event.key === "ArrowRight"
        ) {

            nextQuestion();

        }

        if (
            event.key === "ArrowLeft"
        ) {

            previousQuestion();

        }

        const number =
            Number(
                event.key
            );

        if (
            number >= 1 &&
            number <= 4
        ) {

            const answer =
                String.fromCharCode(
                    64 + number
                );

            const options =
                getQuestionOptions(
                    currentTest.questions[
                        currentQuestion
                    ]
                );

            if (
                options.length >= number
            ) {

                selectAnswer(
                    answer
                );

                const input =
                    document.querySelector(
                        `input[name="answer"][value="${answer}"]`
                    );

                if (input) {

                    input.checked =
                        true;
                }

            }

        }

    }
);


/* =========================================================
   GLOBAL ERROR PROTECTION
========================================================= */

window.addEventListener(
    "error",
    function(event) {

        console.warn(
            "GS Junction App Error:",
            event.error || event.message
        );

    }
);


/* =========================================================
   END OF MASTER APP.JS
========================================================= */
