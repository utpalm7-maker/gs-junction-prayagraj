/* =========================================================
   GS JUNCTION PRAYAGRAJ
   POWERED BY LIVE STUDY ALLAHABAD
   MASTER APP.JS
   =========================================================

   मुख्य सुविधाएँ:
   - Admin / Student Login
   - Student Dashboard
   - Admin Dashboard
   - Automatic Tests Loading: tests/index.json
   - अलग-अलग परीक्षा के Tests
   - PCS
   - UPSSSC
   - TGT GS
   - PGT GS
   - LT Grade
   - UGC NET
   - TET
   - CTET
   - 45 सेकंड प्रति प्रश्न
   - Previous / Next / Skip
   - Question Palette
   - Result / Score / Accuracy
   - LocalStorage
   - WhatsApp / Telegram / Facebook / YouTube
   - Courses / Notes / Live Classes / Notifications
   - Admin Contact & Social Links
   ========================================================= */


/* =========================================================
   GLOBAL SETTINGS
   ========================================================= */

const APP_CONFIG = {

    name: "GS JUNCTION PRAYAGRAJ",

    poweredBy: "LIVE STUDY ALLAHABAD",

    tagline:
        "PCS UPSSSC • TGT • PGT • LT GRADE • UGC NET • TET • CTET",

    timePerQuestion: 45,

    maxQuestions: 150,

    testIndexFile:
        "tests/index.json"

};


/* =========================================================
   GLOBAL VARIABLES
   ========================================================= */

let availableTests = [];

let currentTest = null;

let test = [];

let current = 0;

let score = 0;

let timeLeft = 0;

let timerId = null;

let selectedAnswers = [];

let testStarted = false;

let currentUser = null;


/* =========================================================
   DEFAULT SOCIAL LINKS
   ========================================================= */

const DEFAULT_LINKS = {

    whatsapp: "",

    telegram: "",

    facebook: "",

    youtube: "",

    website: ""

};


/* =========================================================
   DEFAULT ADMIN DATA
   ========================================================= */

const DEFAULT_ADMIN = {

    username: "admin",

    password: "admin123"

};


/* =========================================================
   PAGE NAVIGATION
   ========================================================= */

function show(id) {

    document
        .querySelectorAll("main section")
        .forEach(section => {

            section.classList.remove("active");

        });


    const element =
        document.getElementById(id);


    if (element) {

        element.classList.add("active");

    }


    window.scrollTo(0, 0);


    closeMobileNav();

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


function closeMobileNav() {

    const nav =
        document.getElementById("nav");


    if (nav) {

        nav.classList.remove("open");

    }

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(
            /[&<>"']/g,
            character => {

                return {

                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#039;"

                }[character];

            }
        );

}


/* =========================================================
   LOCAL STORAGE HELPERS
   ========================================================= */

function getStorage(key, fallback = null) {

    try {

        const value =
            localStorage.getItem(key);


        if (value === null) {

            return fallback;

        }


        return JSON.parse(value);

    } catch {

        return fallback;

    }

}


function setStorage(key, value) {

    try {

        localStorage.setItem(
            key,
            JSON.stringify(value)
        );

    } catch (error) {

        console.error(
            "Storage Error:",
            error
        );

    }

}


/* =========================================================
   USER PROFILE
   ========================================================= */

function saveName() {

    const input =
        document.getElementById("name");


    const name =
        input
            ? input.value.trim()
            : "";


    if (!name) {

        alert(
            "कृपया अपना नाम लिखें।"
        );

        return;

    }


    localStorage.setItem(
        "gsName",
        name
    );


    if (currentUser) {

        currentUser.name =
            name;


        setStorage(
            "gsCurrentUser",
            currentUser
        );

    }


    const msg =
        document.getElementById("msg");


    if (msg) {

        msg.textContent =
            "प्रोफाइल सुरक्षित: " +
            name;

    }

}


/* =========================================================
   GET CURRENT USER
   ========================================================= */

function loadCurrentUser() {

    currentUser =
        getStorage(
            "gsCurrentUser",
            null
        );


    const savedName =
        localStorage.getItem(
            "gsName"
        );


    if (
        !currentUser &&
        savedName
    ) {

        currentUser = {

            role: "student",

            name: savedName

        };

    }

}


/* =========================================================
   LOGIN
   ========================================================= */

function loginUser() {

    const usernameElement =
        document.getElementById(
            "loginUsername"
        );


    const passwordElement =
        document.getElementById(
            "loginPassword"
        );


    const username =
        usernameElement
            ? usernameElement.value.trim()
            : "";


    const password =
        passwordElement
            ? passwordElement.value
            : "";


    if (!username || !password) {

        alert(
            "Username और Password भरें।"
        );

        return;

    }


    /*
       Admin Login
    */

    const admin =
        getStorage(
            "gsAdmin",
            DEFAULT_ADMIN
        );


    if (
        username === admin.username &&
        password === admin.password
    ) {

        currentUser = {

            role: "admin",

            name: "Administrator",

            username: username

        };


        setStorage(
            "gsCurrentUser",
            currentUser
        );


        showAdminDashboard();

        return;

    }


    /*
       Student Login
    */

    const students =
        getStorage(
            "gsStudents",
            []
        );


    const student =
        students.find(
            item =>
                item.username === username &&
                item.password === password
        );


    if (student) {

        currentUser = {

            role: "student",

            name:
                student.name ||
                username,

            username: username

        };


        setStorage(
            "gsCurrentUser",
            currentUser
        );


        localStorage.setItem(
            "gsName",
            currentUser.name
        );


        showStudentDashboard();

        return;

    }


    /*
       Demo Student Login
    */

    if (
        username === "student" &&
        password === "1234"
    ) {

        currentUser = {

            role: "student",

            name: "Student",

            username: username

        };


        setStorage(
            "gsCurrentUser",
            currentUser
        );


        showStudentDashboard();

        return;

    }


    alert(
        "Login details सही नहीं हैं।"
    );

}


/* =========================================================
   LOGOUT
   ========================================================= */

function logout() {

    clearInterval(timerId);

    timerId = null;

    testStarted = false;

    currentUser = null;

    localStorage.removeItem(
        "gsCurrentUser"
    );


    show("home");

}


/* =========================================================
   SHOW LOGIN
   ========================================================= */

function showLogin() {

    show("login");

}


/* =========================================================
   STUDENT DASHBOARD
   ========================================================= */

function showStudentDashboard() {

    show("studentDashboard");


    const name =
        currentUser?.name ||
        "Student";


    const nameElements =
        document.querySelectorAll(
            ".student-name"
        );


    nameElements.forEach(
        element => {

            element.textContent =
                name;

        }
    );


    renderStudentTests();

}


/* =========================================================
   ADMIN DASHBOARD
   ========================================================= */

function showAdminDashboard() {

    show("adminDashboard");


    renderAdminTests();

    renderAdminSettings();

}


/* =========================================================
   AUTH CHECK
   ========================================================= */

function checkLogin() {

    loadCurrentUser();


    if (!currentUser) {

        show("home");

        return;

    }


    if (
        currentUser.role ===
        "admin"
    ) {

        showAdminDashboard();

    } else {

        showStudentDashboard();

    }

}


/* =========================================================
   LOAD TEST INDEX
   ========================================================= */

async function loadAvailableTests() {

    try {

        const response =
            await fetch(
                APP_CONFIG.testIndexFile +
                "?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "tests/index.json नहीं मिला"
            );

        }


        const indexData =
            await response.json();


        /*
           index.json के कई format स्वीकार होंगे
        */

        let files = [];


        if (
            Array.isArray(indexData)
        ) {

            files =
                indexData;

        } else if (
            Array.isArray(
                indexData.tests
            )
        ) {

            files =
                indexData.tests;

        }


        availableTests = [];


        for (
            const item of files
        ) {

            let file = "";

            let title = "";

            let exam = "";

            let subject = "";


            if (
                typeof item ===
                "string"
            ) {

                file =
                    item;

                title =
                    item;

            } else {

                file =
                    item.file ||
                    item.path ||
                    item.url ||
                    "";

                title =
                    item.title ||
                    item.name ||
                    file;

                exam =
                    item.exam ||
                    "";

                subject =
                    item.subject ||
                    "";

            }


            if (!file) {

                continue;

            }


            /*
               अगर केवल filename दिया है
            */

            if (
                !file.startsWith(
                    "http"
                ) &&
                !file.startsWith(
                    "tests/"
                )
            ) {

                file =
                    "tests/" +
                    file;

            }


            const questions =
                await loadTestFile(
                    file
                );


            if (
                questions.length > 0
            ) {

                availableTests.push({

                    file: file,

                    title: title,

                    exam: exam,

                    subject: subject,

                    questions: questions

                });

            }

        }


        console.log(
            "Available Tests:",
            availableTests
        );


        renderStudentTests();

        renderAdminTests();


        return availableTests;

    } catch (error) {

        console.error(
            "Test Index Error:",
            error
        );


        /*
           पुराने तरीके से एक file
           भी fallback के रूप में
        */

        const fallback =
            "tests/uppsc-gs-001.txt";


        const questions =
            await loadTestFile(
                fallback
            );


        if (
            questions.length > 0
        ) {

            availableTests = [

                {

                    file:
                        fallback,

                    title:
                        "GS Test 001",

                    exam:
                        "UPPSC",

                    subject:
                        "GS",

                    questions:
                        questions

                }

            ];

        }


        renderStudentTests();

        renderAdminTests();


        return availableTests;

    }

}


/* =========================================================
   LOAD TXT TEST
   ========================================================= */

async function loadTestFile(file) {

    try {

        const response =
            await fetch(
                file +
                "?v=" +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                "File नहीं मिली: " +
                file
            );

        }


        const text =
            await response.text();


        const questions =
            parseQuestions(
                text
            );


        console.log(
            file +
            " → " +
            questions.length +
            " questions"
        );


        return questions;

    } catch (error) {

        console.error(
            "TXT Load Error:",
            error
        );


        return [];

    }

}


/* =========================================================
   CLEAN TEXT
   ========================================================= */

function cleanText(text) {

    if (!text) {

        return "";

    }


    return String(text)

        .replace(
            /\r/g,
            ""
        )

        .replace(
            /\*\*/g,
            ""
        )

        .replace(
            /__([^_]+)__/g,
            "$1"
        )

        .trim();

}


/* =========================================================
   PARSE QUESTIONS
   ========================================================= */

function parseQuestions(text) {

    if (!text) {

        return [];

    }


    text =
        text.replace(
            /\r/g,
            ""
        );


    /*
       Markdown headings हटाएँ
    */

    text =
        text.replace(
            /^#{1,6}\s+.*$/gm,
            ""
        );


    /*
       Question number:
       1.
       1)
       **1.**
       **1)**
    */

    const questionRegex =
        /(?:^|\n)\s*(?:\*\*)?\s*(\d{1,3})\s*[\.\)]\s*(?:\*\*)?\s*/g;


    const matches = [];


    let match;


    while (
        (match =
            questionRegex.exec(
                text
            )) !== null
    ) {

        matches.push({

            number:
                Number(
                    match[1]
                ),

            start:
                match.index,

            contentStart:
                questionRegex.lastIndex

        });

    }


    const questions = [];


    for (
        let i = 0;
        i < matches.length;
        i++
    ) {

        const start =
            matches[i].contentStart;


        const end =
            i + 1 <
            matches.length

                ? matches[
                    i + 1
                  ].start

                : text.length;


        let block =
            text
                .slice(
                    start,
                    end
                )
                .trim();


        if (!block) {

            continue;

        }


        /*
           Answer
        */

        const answerMatch =
            block.match(
                /उत्तर\s*:\s*\(?([ABCD])\)?/i
            );


        if (!answerMatch) {

            continue;

        }


        const answer =
            answerMatch[1]
                .toUpperCase()
                .charCodeAt(0)
                - 65;


        /*
           Answer हटाएँ
        */

        let questionPart =
            block
                .slice(
                    0,
                    answerMatch.index
                )
                .trim();


        /*
           Options
        */

        const optionRegex =
            /(?:^|\n|\s)(?:\*\*)?\s*\(([ABCD])\)\s*(?:\*\*)?\s*/gi;


        const optionMatches = [];


        let optionMatch;


        while (
            (
                optionMatch =
                    optionRegex.exec(
                        questionPart
                    )
            ) !== null
        ) {

            optionMatches.push({

                letter:
                    optionMatch[1]
                        .toUpperCase(),

                index:
                    optionMatch.index,

                contentStart:
                    optionRegex.lastIndex

            });

        }


        /*
           Inline fallback
        */

        if (
            optionMatches.length < 4
        ) {

            const inlineRegex =
                /(?:\*\*)?\(([ABCD])\)(?:\*\*)?\s*/gi;


            optionMatches.length = 0;


            while (
                (
                    optionMatch =
                        inlineRegex.exec(
                            questionPart
                        )
                ) !== null
            ) {

                optionMatches.push({

                    letter:
                        optionMatch[1]
                            .toUpperCase(),

                    index:
                        optionMatch.index,

                    contentStart:
                        inlineRegex.lastIndex

                });

            }

        }


        if (
            optionMatches.length < 4
        ) {

            continue;

        }


        /*
           Question
        */

        const questionText =
            cleanText(
                questionPart.slice(
                    0,
                    optionMatches[0].index
                )
            );


        const options = [];


        for (
            let j = 0;
            j < optionMatches.length;
            j++
        ) {

            const optionStart =
                optionMatches[
                    j
                ].contentStart;


            const optionEnd =
                j + 1 <
                optionMatches.length

                    ? optionMatches[
                        j + 1
                      ].index

                    : questionPart.length;


            const optionText =
                cleanText(
                    questionPart.slice(
                        optionStart,
                        optionEnd
                    )
                );


            if (optionText) {

                options.push(
                    optionText
                );

            }

        }


        if (
            options.length < 4
        ) {

            continue;

        }


        questions.push({

            q:
                questionText,

            o:
                options.slice(
                    0,
                    4
                ),

            a:
                answer

        });

    }


    return questions;

}


/* =========================================================
   RENDER STUDENT TESTS
   ========================================================= */

function renderStudentTests() {

    const container =
        document.getElementById(
            "studentTests"
        );


    if (!container) {

        return;

    }


    if (
        availableTests.length === 0
    ) {

        container.innerHTML = `

            <div class="card">

                <h3>📝 Tests</h3>

                <p>
                    अभी कोई Test उपलब्ध नहीं है।
                </p>

                <button
                    type="button"
                    onclick="loadAvailableTests()">
                    🔄 Refresh Tests
                </button>

            </div>

        `;

        return;

    }


    container.innerHTML = `

        <div class="test-grid">

            ${
                availableTests
                    .map(
                        (item, index) => `

                        <div
                            class="card test-card">

                            <h3>
                                📝
                                ${escapeHtml(
                                    item.title
                                )}
                            </h3>

                            <p>
                                ${
                                    escapeHtml(
                                        item.exam ||
                                        "General"
                                    )
                                }

                                ${
                                    item.subject
                                        ? " • " +
                                          escapeHtml(
                                              item.subject
                                          )
                                        : ""
                                }
                            </p>

                            <p>
                                📚
                                ${
                                    item.questions.length
                                }
                                प्रश्न
                            </p>

                            <p>
                                ⏱️
                                ${
                                    APP_CONFIG.timePerQuestion
                                }
                                सेकंड/प्रश्न
                            </p>

                            <button
                                type="button"
                                onclick="startTest(${index})">

                                ▶️ Test शुरू करें

                            </button>

                        </div>

                    `
                    )
                    .join("")
            }

        </div>

    `;

}


/* =========================================================
   ADMIN TESTS
   ========================================================= */

function renderAdminTests() {

    const container =
        document.getElementById(
            "adminTests"
        );


    if (!container) {

        return;

    }


    if (
        availableTests.length === 0
    ) {

        container.innerHTML = `

            <p>
                कोई Test उपलब्ध नहीं है।
            </p>

        `;

        return;

    }


    container.innerHTML =
        availableTests
            .map(
                (item, index) => `

                <div class="admin-test-row">

                    <strong>
                        ${index + 1}.
                        ${escapeHtml(
                            item.title
                        )}
                    </strong>

                    <span>
                        ${
                            item.questions.length
                        }
                        प्रश्न
                    </span>

                    <span>
                        ${
                            escapeHtml(
                                item.exam ||
                                "General"
                            )
                        }
                    </span>

                </div>

            `
            )
            .join("");

}


/* =========================================================
   QUESTION COUNT
   ========================================================= */

function getQuestionCount() {

    const input =
        document.getElementById(
            "count"
        );


    let count =
        input
            ? Number(input.value)
            : APP_CONFIG.maxQuestions;


    if (
        !Number.isFinite(count)
    ) {

        count =
            APP_CONFIG.maxQuestions;

    }


    count =
        Math.max(
            1,
            Math.min(
                count,
                APP_CONFIG.maxQuestions
            )
        );


    return count;

}


/* =========================================================
   START TEST
   ========================================================= */

async function startTest(testIndex = 0) {

    clearInterval(timerId);


    if (
        availableTests.length === 0
    ) {

        await loadAvailableTests();

    }


    const selectedTest =
        availableTests[
            Number(testIndex)
        ];


    if (!selectedTest) {

        alert(
            "Test उपलब्ध नहीं है।"
        );

        return;

    }


    currentTest =
        selectedTest;


    let requestedCount =
        getQuestionCount();


    const count =
        Math.min(
            requestedCount,
            selectedTest.questions.length
        );


    /*
       Random Questions
    */

    test =
        [...selectedTest.questions]
            .sort(
                () =>
                    Math.random() -
                    0.5
            )
            .slice(
                0,
                count
            );


    if (
        test.length === 0
    ) {

        alert(
            "इस Test में प्रश्न नहीं मिले।"
        );

        return;

    }


    current = 0;

    score = 0;

    selectedAnswers =
        new Array(
            test.length
        );


    timeLeft =
        test.length *
        APP_CONFIG.timePerQuestion;


    testStarted = true;


    /*
       Hide setup
    */

    const setup =
        document.getElementById(
            "testSetup"
        );


    const testArea =
        document.getElementById(
            "testArea"
        );


    const result =
        document.getElementById(
            "resultArea"
        );


    if (setup) {

        setup.classList.add(
            "hidden"
        );

    }


    if (result) {

        result.classList.add(
            "hidden"
        );

    }


    if (testArea) {

        testArea.classList.remove(
            "hidden"
        );

    }


    renderQuestion();

    updateTimer();


    timerId =
        setInterval(
            () => {

                timeLeft--;

                updateTimer();


                if (
                    timeLeft <= 0
                ) {

                    clearInterval(
                        timerId
                    );

                    timeLeft = 0;

                    updateTimer();

                    finishTest(
                        true
                    );

                }

            },
            1000
        );

}


/* =========================================================
   TIMER
   ========================================================= */

function updateTimer() {

    const timer =
        document.getElementById(
            "timer"
        );


    if (!timer) {

        return;

    }


    const minutes =
        Math.floor(
            timeLeft / 60
        )
            .toString()
            .padStart(
                2,
                "0"
            );


    const seconds =
        (
            timeLeft % 60
        )
            .toString()
            .padStart(
                2,
                "0"
            );


    timer.textContent =
        "⏱️ " +
        minutes +
        ":" +
        seconds;


    /*
       Low time indication
    */

    timer.classList.toggle(
        "danger",
        timeLeft <= 30
    );

}


/* =========================================================
   RENDER QUESTION
   ========================================================= */

function renderQuestion() {

    const area =
        document.getElementById(
            "testArea"
        );


    if (
        !area ||
        !test[current]
    ) {

        return;

    }


    const question =
        test[current];


    let html = "";


    /*
       Test Header
    */

    html += `

        <div class="test-header">

            <div>

                <strong>
                    ${
                        escapeHtml(
                            currentTest?.title ||
                            "Online Test"
                        )
                    }
                </strong>

            </div>

            <div
                id="timer"
                class="timer">
            </div>

        </div>

    `;


    /*
       Progress
    */

    html += `

        <div class="progress">

            प्रश्न
            ${current + 1}
            /
            ${test.length}

        </div>

    `;


    /*
       Question
    */

    html += `

        <div class="question-text">

            <h3>

                ${escapeHtml(
                    question.q
                ).replace(
                    /\n/g,
                    "<br>"
                )}

            </h3>

        </div>

    `;


    /*
       Options
    */

    html += `
        <div class="options">
    `;


    question.o.forEach(
        (option, index) => {

            const selected =
                selectedAnswers[
                    current
                ] === index
                    ? "selected"
                    : "";


            html += `

                <button
                    type="button"
                    class="option ${selected}"
                    onclick="answer(${index})">

                    <strong>
                        ${
                            String.fromCharCode(
                                65 + index
                            )
                        }.
                    </strong>

                    ${escapeHtml(
                        option
                    )}

                </button>

            `;

        }
    );


    html += `
        </div>
    `;


    /*
       Navigation
    */

    html += `

        <div class="test-nav">

            <button
                type="button"
                onclick="prevQuestion()"
                ${
                    current === 0
                        ? "disabled"
                        : ""
                }>

                ⬅️ पिछला

            </button>

            <button
                type="button"
                onclick="nextQuestion()">

                ${
                    current ===
                    test.length - 1
                        ? "🏁 समाप्त करें"
                        : "अगला ➡️"
                }

            </button>

            <button
                type="button"
                onclick="skipQuestion()">

                ⏭️ Skip

            </button>

        </div>

    `;


    /*
       Palette
    */

    html += `

        <div class="palette-title">

            प्रश्न सूची

        </div>

        <div class="palette">

    `;


    test.forEach(
        (_, index) => {

            let classes = "";


            if (
                index === current
            ) {

                classes +=
                    " current";

            }


            if (
                selectedAnswers[index] !==
                undefined
            ) {

                classes +=
                    " answered";

            }


            html += `

                <button
                    type="button"
                    class="${classes}"
                    onclick="goQuestion(${index})">

                    ${index + 1}

                </button>

            `;

        }
    );


    html += `
        </div>
    `;


    area.innerHTML =
        html;


    updateTimer();

}


/* =========================================================
   SELECT ANSWER
   ========================================================= */

function answer(number) {

    selectedAnswers[
        current
    ] = number;


    renderQuestion();

}


/* =========================================================
   NEXT QUESTION
   ========================================================= */

function nextQuestion() {

    if (
        current <
        test.length - 1
    ) {

        current++;

        renderQuestion();

    } else {

        finishTest(false);

    }

}


/* =========================================================
   PREVIOUS QUESTION
   ========================================================= */

function prevQuestion() {

    if (
        current > 0
    ) {

        current--;

        renderQuestion();

    }

}


/* =========================================================
   SKIP
   ========================================================= */

function skipQuestion() {

    if (
        current <
        test.length - 1
    ) {

        current++;

        renderQuestion();

    } else {

        finishTest(false);

    }

}


/* =========================================================
   GO TO QUESTION
   ========================================================= */

function goQuestion(index) {

    if (
        index >= 0 &&
        index < test.length
    ) {

        current =
            index;

        renderQuestion();

    }

}


/* =========================================================
   FINISH TEST
   ========================================================= */

function finishTest(
    timeout = false
) {

    clearInterval(timerId);

    timerId = null;

    testStarted = false;


    score = 0;


    let attempted = 0;


    selectedAnswers.forEach(
        (answerValue, index) => {

            if (
                answerValue !==
                    undefined &&
                test[index]
            ) {

                attempted++;


                if (
                    answerValue ===
                    test[index].a
                ) {

                    score++;

                }

            }

        }
    );


    const total =
        test.length;


    const wrong =
        attempted -
        score;


    const unanswered =
        total -
        attempted;


    const accuracy =
        attempted > 0
            ? Math.round(
                (
                    score /
                    attempted
                ) *
                100
            )
            : 0;


    const resultData = {

        test:
            currentTest?.title ||
            "Test",

        exam:
            currentTest?.exam ||
            "",

        subject:
            currentTest?.subject ||
            "",

        score:
            score,

        total:
            total,

        attempted:
            attempted,

        wrong:
            wrong,

        unanswered:
            unanswered,

        accuracy:
            accuracy,

        date:
            new Date()
                .toLocaleString(
                    "hi-IN"
                )

    };


    /*
       Save last result
    */

    setStorage(
        "gsLastResult",
        resultData
    );


    /*
       Save history
    */

    const history =
        getStorage(
            "gsResultHistory",
            []
        );


    history.unshift(
        resultData
    );


    setStorage(
        "gsResultHistory",
        history.slice(
            0,
            50
        )
    );


    /*
       Hide test
    */

    const testArea =
        document.getElementById(
            "testArea"
        );


    if (testArea) {

        testArea.classList.add(
            "hidden"
        );

    }


    /*
       Show result
    */

    const result =
        document.getElementById(
            "resultArea"
        );


    if (!result) {

        return;

    }


    result.classList.remove(
        "hidden"
    );


    result.innerHTML = `

        <div class="result-card">

            <div class="score">

                🏆 Test Complete

            </div>

            <h2>

                ${
                    escapeHtml(
                        currentTest?.title ||
                        "Online Test"
                    )
                }

            </h2>

            <h3>

                प्राप्त अंक:
                ${score} / ${total}

            </h3>

            <p>
                📚 कुल प्रश्न:
                ${total}
            </p>

            <p>
                ⏱️ प्रति प्रश्न:
                ${APP_CONFIG.timePerQuestion}
                सेकंड
            </p>

            <p>
                ⏰ कुल समय:
                ${formatDuration(
                    total *
                    APP_CONFIG.timePerQuestion
                )}
            </p>

            <p>
                ✅ सही:
                ${score}
            </p>

            <p>
                ❌ गलत:
                ${wrong}
            </p>

            <p>
                ⭕ अनुत्तरित:
                ${unanswered}
            </p>

            <p>
                🎯 Accuracy:
                ${accuracy}%
            </p>

            ${
                timeout
                    ? `
                        <p>
                            ⏰ समय समाप्त हो गया।
                        </p>
                    `
                    : ""
            }

            <hr>

            <button
                type="button"
                onclick="resetTest()">

                🔄 फिर से Test दें

            </button>

            <button
                type="button"
                onclick="showStudentDashboard()">

                🏠 Dashboard

            </button>

        </div>

    `;

}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatDuration(seconds) {

    const minutes =
        Math.floor(
            seconds / 60
        );


    const remaining =
        seconds % 60;


    return (
        minutes +
        " मिनट " +
        remaining +
        " सेकंड"
    );

}


/* =========================================================
   RESET TEST
   ========================================================= */

function resetTest() {

    clearInterval(timerId);


    test = [];

    current = 0;

    score = 0;

    timeLeft = 0;

    selectedAnswers = [];

    testStarted = false;


    const result =
        document.getElementById(
            "resultArea"
        );


    const testArea =
        document.getElementById(
            "testArea"
        );


    if (result) {

        result.classList.add(
            "hidden"
        );

    }


    if (testArea) {

        testArea.classList.add(
            "hidden"
        );

    }


    showStudentDashboard();

}


/* =========================================================
   RESULT HISTORY
   ========================================================= */

function showResults() {

    const history =
        getStorage(
            "gsResultHistory",
            []
        );


    const container =
        document.getElementById(
            "resultsList"
        );


    if (!container) {

        return;

    }


    if (
        history.length === 0
    ) {

        container.innerHTML = `

            <div class="card">

                <h3>
                    🏆 Test Result
                </h3>

                <p>
                    अभी कोई Result उपलब्ध नहीं है।
                </p>

            </div>

        `;

        show("results");

        return;

    }


    container.innerHTML = `

        <div class="result-history">

            ${
                history
                    .map(
                        item => `

                        <div class="card">

                            <h3>
                                📝
                                ${escapeHtml(
                                    item.test
                                )}
                            </h3>

                            <p>
                                अंक:
                                <strong>
                                    ${item.score}
                                    /
                                    ${item.total}
                                </strong>
                            </p>

                            <p>
                                Accuracy:
                                ${item.accuracy}%
                            </p>

                            <p>
                                तारीख:
                                ${escapeHtml(
                                    item.date
                                )}
                            </p>

                        </div>

                    `
                    )
                    .join("")
            }

        </div>

    `;


    show("results");

}


/* =========================================================
   COURSES
   ========================================================= */

function showCourses() {

    const courses =
        getStorage(
            "gsCourses",
            []
        );


    const container =
        document.getElementById(
            "coursesList"
        );


    if (!container) {

        show("courses");

        return;

    }


    if (
        courses.length === 0
    ) {

        container.innerHTML = `

            <div class="card">

                <h3>
                    📚 Courses
                </h3>

                <p>
                    Courses जल्द उपलब्ध होंगे।
                </p>

            </div>

        `;

    } else {

        container.innerHTML =
            courses
                .map(
                    course => `

                    <div class="card">

                        <h3>
                            ${escapeHtml(
                                course.title
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                course.description ||
                                ""
                            )}
                        </p>

                        ${
                            course.link
                                ? `
                                    <a
                                        href="${escapeHtml(
                                            course.link
                                        )}"
                                        target="_blank">

                                        ▶️ Course देखें

                                    </a>
                                `
                                : ""
                        }

                    </div>

                `
                )
                .join("");

    }


    show("courses");

}


/* =========================================================
   NOTES / PDF
   ========================================================= */

function showNotes() {

    const notes =
        getStorage(
            "gsNotes",
            []
        );


    const container =
        document.getElementById(
            "notesList"
        );


    if (!container) {

        show("notes");

        return;

    }


    if (
        notes.length === 0
    ) {

        container.innerHTML = `

            <div class="card">

                <h3>
                    📄 Notes / PDF
                </h3>

                <p>
                    Notes और PDF जल्द उपलब्ध होंगे।
                </p>

            </div>

        `;

    } else {

        container.innerHTML =
            notes
                .map(
                    note => `

                    <div class="card">

                        <h3>
                            📄
                            ${escapeHtml(
                                note.title
                            )}
                        </h3>

                        ${
                            note.link
                                ? `
                                    <a
                                        href="${escapeHtml(
                                            note.link
                                        )}"
                                        target="_blank">

                                        📥 PDF खोलें

                                    </a>
                                `
                                : ""
                        }

                    </div>

                `
                )
                .join("");

    }


    show("notes");

}


/* =========================================================
   NOTIFICATIONS
   ========================================================= */

function showNotifications() {

    const notifications =
        getStorage(
            "gsNotifications",
            []
        );


    const container =
        document.getElementById(
            "notificationsList"
        );


    if (!container) {

        show("notifications");

        return;

    }


    if (
        notifications.length === 0
    ) {

        container.innerHTML = `

            <div class="card">

                <h3>
                    🔔 Notifications
                </h3>

                <p>
                    अभी कोई नई Notification नहीं है।
                </p>

            </div>

        `;

    } else {

        container.innerHTML =
            notifications
                .map(
                    notification => `

                    <div class="card">

                        <h3>
                            🔔
                            ${escapeHtml(
                                notification.title
                            )}
                        </h3>

                        <p>
                            ${escapeHtml(
                                notification.message ||
                                ""
                            )}
                        </p>

                    </div>

                `
                )
                .join("");

    }


    show("notifications");

}


/* =========================================================
   SOCIAL LINKS
   ========================================================= */

function getLinks() {

    return getStorage(
        "gsSocialLinks",
        DEFAULT_LINKS
    );

}


function openSocial(platform) {

    const links =
        getLinks();


    const url =
        links[platform];


    if (!url) {

        alert(
            platform +
            " link अभी Admin द्वारा नहीं जोड़ा गया है।"
        );

        return;

    }


    window.open(
        url,
        "_blank"
    );

}


/* =========================================================
   YOUTUBE
   ========================================================= */

function youtube() {

    openSocial(
        "youtube"
    );

}


/* =========================================================
   CONTACT
   ========================================================= */

function showContact() {

    const links =
        getLinks();


    const container =
        document.getElementById(
            "contactLinks"
        );


    if (container) {

        container.innerHTML = `

            <div class="contact-grid">

                ${
                    links.whatsapp
                        ? `
                            <a
                                href="${escapeHtml(
                                    links.whatsapp
                                )}"
                                target="_blank">

                                📱 WhatsApp

                            </a>
                        `
                        : ""
                }

                ${
                    links.telegram
                        ? `
                            <a
                                href="${escapeHtml(
                                    links.telegram
                                )}"
                                target="_blank">

                                ✈️ Telegram

                            </a>
                        `
                        : ""
                }

                ${
                    links.facebook
                        ? `
                            <a
                                href="${escapeHtml(
                                    links.facebook
                                )}"
                                target="_blank">

                                📘 Facebook

                            </a>
                        `
                        : ""
                }

                ${
                    links.youtube
                        ? `
                            <a
                                href="${escapeHtml(
                                    links.youtube
                                )}"
                                target="_blank">

                                ▶️ YouTube

                            </a>
                        `
                        : ""
                }

            </div>

        `;

    }


    show("contact");

}


/* =========================================================
   LIVE CLASSES
   ========================================================= */

function showLiveClasses() {

    const links =
        getLinks();


    const container =
        document.getElementById(
            "liveClasses"
        );


    if (container) {

        container.innerHTML = `

            <div class="card">

                <h2>
                    🎥 Live Classes
                </h2>

                <p>
                    LIVE STUDY ALLAHABAD
                </p>

                ${
                    links.youtube
                        ? `
                            <button
                                type="button"
                                onclick="youtube()">

                                ▶️ YouTube Live Classes

                            </button>
                        `
                        : `
                            <p>
                                YouTube Live link
                                Admin द्वारा जोड़ा जाएगा।
                            </p>
                        `
                }

            </div>

        `;

    }


    show("live");

}


/* =========================================================
   ABOUT
   ========================================================= */

function showAbout() {

    const container =
        document.getElementById(
            "aboutContent"
        );


    if (container) {

        container.innerHTML = `

            <div class="card">

                <h2>
                    GS JUNCTION PRAYAGRAJ
                </h2>

                <h3>
                    Powered by
                    LIVE STUDY ALLAHABAD
                </h3>

                <p>
                    PCS, UPSSSC, TGT, PGT,
                    LT Grade, UGC NET,
                    TET, CTET तथा अन्य
                    प्रतियोगी परीक्षाओं हेतु
                    अध्ययन एवं Online Test Platform।
                </p>

            </div>

        `;

    }


    show("about");

}


/* =========================================================
   ADMIN SETTINGS
   ========================================================= */

function renderAdminSettings() {

    const links =
        getLinks();


    const whatsapp =
        document.getElementById(
            "adminWhatsapp"
        );


    const telegram =
        document.getElementById(
            "adminTelegram"
        );


    const facebook =
        document.getElementById(
            "adminFacebook"
        );


    const youtubeInput =
        document.getElementById(
            "adminYoutube"
        );


    if (whatsapp) {

        whatsapp.value =
            links.whatsapp || "";

    }


    if (telegram) {

        telegram.value =
            links.telegram || "";

    }


    if (facebook) {

        facebook.value =
            links.facebook || "";

    }


    if (youtubeInput) {

        youtubeInput.value =
            links.youtube || "";

    }

}


/* =========================================================
   SAVE ADMIN LINKS
   ========================================================= */

function saveAdminLinks() {

    const links = {

        whatsapp:
            document.getElementById(
                "adminWhatsapp"
            )?.value.trim() || "",

        telegram:
            document.getElementById(
                "adminTelegram"
            )?.value.trim() || "",

        facebook:
            document.getElementById(
                "adminFacebook"
            )?.value.trim() || "",

        youtube:
            document.getElementById(
                "adminYoutube"
            )?.value.trim() || ""

    };


    setStorage(
        "gsSocialLinks",
        links
    );


    alert(
        "Social Links सुरक्षित कर दिए गए।"
    );

}


/* =========================================================
   ADMIN ADD NOTIFICATION
   ========================================================= */

function addNotification() {

    const titleInput =
        document.getElementById(
            "notificationTitle"
        );


    const messageInput =
        document.getElementById(
            "notificationMessage"
        );


    const title =
        titleInput
            ? titleInput.value.trim()
            : "";


    const message =
        messageInput
            ? messageInput.value.trim()
            : "";


    if (!title) {

        alert(
            "Notification Title लिखें।"
        );

        return;

    }


    const notifications =
        getStorage(
            "gsNotifications",
            []
        );


    notifications.unshift({

        title:
            title,

        message:
            message,

        date:
            new Date()
                .toLocaleString(
                    "hi-IN"
                )

    });


    setStorage(
        "gsNotifications",
        notifications
    );


    if (titleInput) {

        titleInput.value = "";

    }


    if (messageInput) {

        messageInput.value = "";

    }


    alert(
        "Notification जोड़ दी गई।"
    );

}


/* =========================================================
   ADMIN ADD COURSE
   ========================================================= */

function addCourse() {

    const title =
        document.getElementById(
            "courseTitle"
        )?.value.trim();


    const description =
        document.getElementById(
            "courseDescription"
        )?.value.trim();


    const link =
        document.getElementById(
            "courseLink"
        )?.value.trim();


    if (!title) {

        alert(
            "Course का नाम लिखें।"
        );

        return;

    }


    const courses =
        getStorage(
            "gsCourses",
            []
        );


    courses.push({

        title:
            title,

        description:
            description,

        link:
            link

    });


    setStorage(
        "gsCourses",
        courses
    );


    alert(
        "Course जोड़ दिया गया।"
    );

}


/* =========================================================
   ADMIN ADD NOTES
   ========================================================= */

function addNote() {

    const title =
        document.getElementById(
            "noteTitle"
        )?.value.trim();


    const link =
        document.getElementById(
            "noteLink"
        )?.value.trim();


    if (!title || !link) {

        alert(
            "Note Title और PDF Link दोनों भरें।"
        );

        return;

    }


    const notes =
        getStorage(
            "gsNotes",
            []
        );


    notes.push({

        title:
            title,

        link:
            link

    });


    setStorage(
        "gsNotes",
        notes
    );


    alert(
        "PDF/Note जोड़ दिया गया।"
    );

}


/* =========================================================
   ADMIN ADD STUDENT
   ========================================================= */

function addStudent() {

    const name =
        document.getElementById(
            "studentName"
        )?.value.trim();


    const username =
        document.getElementById(
            "studentUsername"
        )?.value.trim();


    const password =
        document.getElementById(
            "studentPassword"
        )?.value;


    if (
        !name ||
        !username ||
        !password
    ) {

        alert(
            "Student की सभी जानकारी भरें।"
        );

        return;

    }


    const students =
        getStorage(
            "gsStudents",
            []
        );


    if (
        students.some(
            student =>
                student.username ===
                username
        )
    ) {

        alert(
            "यह Username पहले से मौजूद है।"
        );

        return;

    }


    students.push({

        name:
            name,

        username:
            username,

        password:
            password

    });


    setStorage(
        "gsStudents",
        students
    );


    alert(
        "Student Account बना दिया गया।"
    );

}


/* =========================================================
   ADMIN CHANGE PASSWORD
   ========================================================= */

function changeAdminPassword() {

    const newPassword =
        document.getElementById(
            "newAdminPassword"
        )?.value;


    if (
        !newPassword ||
        newPassword.length < 4
    ) {

        alert(
            "कम से कम 4 अक्षर का Password रखें।"
        );

        return;

    }


    const admin =
        getStorage(
            "gsAdmin",
            DEFAULT_ADMIN
        );


    admin.password =
        newPassword;


    setStorage(
        "gsAdmin",
        admin
    );


    alert(
        "Admin Password बदल दिया गया।"
    );

}


/* =========================================================
   FILE UPLOAD
   ========================================================= */

function setupFileUpload() {

    const fileInput =
        document.getElementById(
            "txtFile"
        );


    if (!fileInput) {

        return;

    }


    fileInput.addEventListener(
        "change",
        async function () {

            const file =
                this.files?.[0];


            if (!file) {

                return;

            }


            try {

                const text =
                    await file.text();


                const questions =
                    parseQuestions(
                        text
                    );


                if (
                    questions.length === 0
                ) {

                    alert(
                        "इस TXT में सही format के प्रश्न नहीं मिले।"
                    );

                    return;

                }


                availableTests.push({

                    file:
                        file.name,

                    title:
                        file.name,

                    exam:
                        "Uploaded Test",

                    subject:
                        "GS",

                    questions:
                        questions

                });


                renderStudentTests();

                renderAdminTests();


                alert(

                    file.name +
                    " सफलतापूर्वक लोड हुआ।\n\n" +
                    questions.length +
                    " प्रश्न मिले।"

                );

            } catch (error) {

                console.error(
                    error
                );


                alert(
                    "TXT पढ़ने में समस्या हुई।"
                );

            }

        }
    );

}


/* =========================================================
   SETUP COUNT
   ========================================================= */

function setupCountOptions() {

    const select =
        document.getElementById(
            "count"
        );


    if (!select) {

        return;

    }


    select.innerHTML = "";


    [
        5,
        10,
        20,
        30,
        50,
        75,
        100,
        150
    ].forEach(
        number => {

            const option =
                document.createElement(
                    "option"
                );


            option.value =
                number;


            option.textContent =
                number +
                " प्रश्न";


            select.appendChild(
                option
            );

        }
    );


    select.value =
        "150";

}


/* =========================================================
   AUTO LOAD
   ========================================================= */

window.addEventListener(
    "DOMContentLoaded",
    async () => {

        console.log(
            "GS JUNCTION PRAYAGRAJ App Starting..."
        );


        /*
           User
        */

        loadCurrentUser();


        /*
           Count
        */

        setupCountOptions();


        /*
           Tests
        */

        await loadAvailableTests();


        /*
           File Upload
        */

        setupFileUpload();


        /*
           Saved Name
        */

        const savedName =
            localStorage.getItem(
                "gsName"
            );


        const nameInput =
            document.getElementById(
                "name"
            );


        if (
            savedName &&
            nameInput
        ) {

            nameInput.value =
                savedName;

        }


        /*
           Service Worker
        */

        if (
            "serviceWorker" in
            navigator
        ) {

            navigator.serviceWorker
                .register(
                    "service-worker.js"
                )
                .then(
                    registration => {

                        console.log(
                            "Service Worker:",
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.log(
                            "Service Worker Error:",
                            error
                        );

                    }
                );

        }


        /*
           Current user dashboard
        */

        if (currentUser) {

            if (
                currentUser.role ===
                "admin"
            ) {

                renderAdminTests();

            } else {

                renderStudentTests();

            }

        }


        console.log(
            "GS JUNCTION PRAYAGRAJ READY"
        );

    }
);


/* =========================================================
   GLOBAL FUNCTIONS
   ========================================================= */

window.show =
    show;

window.toggleNav =
    toggleNav;

window.saveName =
    saveName;

window.loginUser =
    loginUser;

window.logout =
    logout;

window.showLogin =
    showLogin;

window.showStudentDashboard =
    showStudentDashboard;

window.showAdminDashboard =
    showAdminDashboard;

window.startTest =
    startTest;

window.answer =
    answer;

window.nextQuestion =
    nextQuestion;

window.prevQuestion =
    prevQuestion;

window.skipQuestion =
    skipQuestion;

window.goQuestion =
    goQuestion;

window.finishTest =
    finishTest;

window.resetTest =
    resetTest;

window.showResults =
    showResults;

window.showCourses =
    showCourses;

window.showNotes =
    showNotes;

window.showNotifications =
    showNotifications;

window.showContact =
    showContact;

window.showLiveClasses =
    showLiveClasses;

window.showAbout =
    showAbout;

window.youtube =
    youtube;

window.openSocial =
    openSocial;

window.saveAdminLinks =
    saveAdminLinks;

window.addNotification =
    addNotification;

window.addCourse =
    addCourse;

window.addNote =
    addNote;

window.addStudent =
    addStudent;

window.changeAdminPassword =
    changeAdminPassword;

window.loadAvailableTests =
    loadAvailableTests;
