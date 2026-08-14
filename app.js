/* =========================================================
   GS JUNCTION PRAYAGRAJ
   SCALABLE ONLINE EDUCATION + TEST PLATFORM
   ========================================================= */

'use strict';


/* =========================================================
   GLOBAL STATE
========================================================= */

let test = [];
let current = 0;
let score = 0;
let timerId = null;
let timeLeft = 0;

let selectedAnswers = [];
let markedQuestions = [];

let availableTests = [];
let currentTestInfo = null;

let testStartedAt = null;
let testTimeLimit = 0;

let currentExamFilter = '';
let currentCategoryFilter = '';
let currentSubjectFilter = '';


/* =========================================================
   CONFIG
========================================================= */

const DEFAULT_TIME_PER_QUESTION = 45;
const DEFAULT_MARKS = 1;
const DEFAULT_NEGATIVE_MARKING = 0;

const MAX_QUESTIONS = 150;

const TEST_INDEX_FILE =
    'tests/index.json';


/* =========================================================
   DEFAULT EXAMS
========================================================= */

const DEFAULT_EXAMS = [
    'UPPSC / PCS',
    'UPSSSC',
    'TGT',
    'PGT',
    'LT GRADE',
    'UGC NET',
    'TET',
    'CTET'
];


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(id) {

    document
        .querySelectorAll('.page')
        .forEach(page => {

            page.classList.remove('active');

        });


    const page =
        document.getElementById(id);


    if (page) {

        page.classList.add('active');

    }


    closeMobileNav();


    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}


/*
   Compatibility with old HTML
*/

function show(id) {
    showPage(id);
}


/* =========================================================
   MOBILE NAVIGATION
========================================================= */

function toggleNav() {

    const nav =
        document.getElementById('nav');


    if (nav) {

        nav.classList.toggle('open');

    }
}


function closeMobileNav() {

    const nav =
        document.getElementById('nav');


    if (nav) {

        nav.classList.remove('open');

    }
}


/* =========================================================
   LOGIN
========================================================= */

function loginStudent() {

    localStorage.setItem(
        'userType',
        'student'
    );

    showPage('home');

    updateStudentProfile();

}


function loginAdmin() {

    const password =
        prompt(
            'Admin Password दर्ज करें:'
        );


    /*
       FRONTEND DEMO PASSWORD ONLY

       Production में Backend Authentication
       लगाना आवश्यक होगा।
    */

    if (password === 'admin123') {

        localStorage.setItem(
            'userType',
            'admin'
        );

        showPage('adminPanel');

    } else {

        alert(
            'गलत Admin Password।'
        );

    }
}


function logout() {

    clearInterval(timerId);

    localStorage.removeItem(
        'userType'
    );

    resetTest();

    showPage('loginPage');

}


/* =========================================================
   USER ROLE
========================================================= */

function getUserType() {

    return (
        localStorage.getItem(
            'userType'
        ) || ''
    );
}


function isAdmin() {

    return (
        getUserType() ===
        'admin'
    );
}


function isStudent() {

    return (
        getUserType() ===
        'student'
    );
}


/* =========================================================
   YOUTUBE
========================================================= */

function youtube() {

    window.open(
        'https://www.youtube.com/',
        '_blank',
        'noopener,noreferrer'
    );
}


/* =========================================================
   CONTACT
========================================================= */

function contactAdmin() {

    alert(
        'Contact details जल्द ही Admin Panel से configurable होंगे।'
    );
}


/* =========================================================
   STUDENT NAME
========================================================= */

function saveName() {

    const input =
        document.getElementById(
            'name'
        );


    const msg =
        document.getElementById(
            'msg'
        );


    const name =
        input
            ? input.value.trim()
            : '';


    if (!name) {

        if (msg) {

            msg.textContent =
                'कृपया अपना नाम लिखें।';

        }

        return;
    }


    localStorage.setItem(
        'gsName',
        name
    );


    if (msg) {

        msg.textContent =
            'प्रोफाइल सुरक्षित: ' +
            name;

    }


    updateStudentProfile();
}


function getStudentName() {

    const input =
        document.getElementById(
            'name'
        );


    if (
        input &&
        input.value.trim()
    ) {

        return input.value.trim();

    }


    return (
        localStorage.getItem(
            'gsName'
        ) ||
        'Student'
    );
}


/* =========================================================
   PROFILE
========================================================= */

function loadProfile() {

    updateStudentProfile();

}


function updateStudentProfile() {

    const name =
        getStudentName();


    const nameElement =
        document.getElementById(
            'studentName'
        );


    if (nameElement) {

        nameElement.textContent =
            name;

    }


    const nameInput =
        document.getElementById(
            'name'
        );


    if (
        nameInput &&
        !nameInput.value
    ) {

        nameInput.value =
            name !== 'Student'
                ? name
                : '';

    }


    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    'testHistory'
                ) || '[]'
            );

        if (
            !Array.isArray(history)
        ) {

            history = [];

        }

    } catch {

        history = [];

    }


    const totalTests =
        document.getElementById(
            'totalTests'
        );


    const bestScore =
        document.getElementById(
            'bestScore'
        );


    const accuracyElement =
        document.getElementById(
            'accuracy'
        );


    if (totalTests) {

        totalTests.textContent =
            history.length;

    }


    let best = 0;


    let accuracySum = 0;


    history.forEach(
        item => {

            const numericScore =
                Number(
                    item.score
                ) || 0;


            if (
                numericScore >
                best
            ) {

                best =
                    numericScore;

            }


            accuracySum +=
                Number(
                    item.accuracy
                ) || 0;

        }
    );


    if (bestScore) {

        bestScore.textContent =
            best;

    }


    if (accuracyElement) {

        const average =
            history.length
                ? Math.round(
                    accuracySum /
                    history.length
                  )
                : 0;


        accuracyElement.textContent =
            average + '%';

    }
}


/* =========================================================
   QUESTION COUNT
========================================================= */

function setupCountOptions() {

    const select =
        document.getElementById(
            'count'
        );


    if (!select) {
        return;
    }


    select.innerHTML = '';


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
                    'option'
                );


            option.value =
                number;


            option.textContent =
                number +
                ' प्रश्न';


            select.appendChild(
                option
            );

        }
    );


    select.value =
        '150';
}


/* =========================================================
   TIME / MARKING
========================================================= */

function getTimePerQuestion() {

    const value =
        Number(
            currentTestInfo?.timePerQuestion
        );


    if (
        Number.isFinite(value) &&
        value > 0
    ) {

        return value;

    }


    return DEFAULT_TIME_PER_QUESTION;
}


function getMarks() {

    const value =
        Number(
            currentTestInfo?.marks
        );


    if (
        Number.isFinite(value)
    ) {

        return value;

    }


    return DEFAULT_MARKS;
}


function getNegativeMarking() {

    const value =
        Number(
            currentTestInfo?.negativeMarking
        );


    if (
        Number.isFinite(value) &&
        value >= 0
    ) {

        return value;

    }


    return DEFAULT_NEGATIVE_MARKING;
}


function calculateTotalTime(
    count
) {

    return (
        Number(count) *
        getTimePerQuestion()
    );
}


/* =========================================================
   FORMAT TIME
========================================================= */

function formatDuration(
    seconds
) {

    seconds =
        Math.max(
            0,
            Number(seconds) || 0
        );


    const hours =
        Math.floor(
            seconds / 3600
        );


    const minutes =
        Math.floor(
            (seconds % 3600) / 60
        );


    const remaining =
        seconds % 60;


    if (hours > 0) {

        return (
            hours +
            ' घंटे ' +
            minutes +
            ' मिनट ' +
            remaining +
            ' सेकंड'
        );

    }


    return (
        minutes +
        ' मिनट ' +
        remaining +
        ' सेकंड'
    );
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHtml(
    value
) {

    return String(
        value ?? ''
    ).replace(
        /[&<>"']/g,
        character => {

            const map = {

                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'

            };


            return map[
                character
            ];

        }
    );
}


/* =========================================================
   CLEAN TEXT
========================================================= */

function cleanText(
    text
) {

    if (!text) {
        return '';
    }


    return String(text)
        .replace(/\r/g, '')
        .replace(/\*\*/g, '')
        .replace(
            /__([^_]+)__/g,
            '$1'
        )
        .replace(
            /\n{3,}/g,
            '\n\n'
        )
        .trim();
}


/* =========================================================
   ANSWER PARSER
========================================================= */

function parseAnswer(
    text
) {

    if (!text) {
        return -1;
    }


    const match =
        text.match(
            /(?:उत्तर|answer)\s*:\s*\(?([ABCD])\)?/i
        );


    if (!match) {

        return -1;

    }


    return (
        match[1]
            .toUpperCase()
            .charCodeAt(0) -
        65
    );
}


/* =========================================================
   TXT QUESTION PARSER
========================================================= */

function parseQuestions(
    text
) {

    if (!text) {
        return [];
    }


    text =
        String(text)
            .replace(/\r/g, '');


    /*
       Remove markdown headings
    */

    text =
        text.replace(
            /^#{1,6}\s+.*$/gm,
            ''
        );


    /*
       Question detection

       1.
       1)
       **1.**
       **1)**
    */

    const questionRegex =
        /(?:^|\n)\s*(?:\*\*)?\s*(\d{1,4})\s*[\.\)]\s*(?:\*\*)?\s*/g;


    const matches = [];


    let match;


    while (
        (
            match =
                questionRegex.exec(
                    text
                )
        ) !== null
    ) {

        matches.push({

            number:
                Number(match[1]),

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
            matches[i]
                .contentStart;


        const end =
            i + 1 <
            matches.length
                ? matches[i + 1].start
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

           उत्तर: (B)
           Answer: B
        */

        const answerMatch =
            block.match(
                /(?:उत्तर|answer)\s*:\s*\(?([ABCD])\)?(?:\s*[^\n]*)?/i
            );


        if (!answerMatch) {
            continue;
        }


        const answer =
            answerMatch[1]
                .toUpperCase()
                .charCodeAt(0) -
            65;


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
                optionMatches[j]
                    .contentStart;


            const optionEnd =
                j + 1 <
                optionMatches.length
                    ? optionMatches[j + 1].index
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
   LOAD TEST INDEX
========================================================= */

async function loadTestIndex() {

    try {

        const response =
            await fetch(
                TEST_INDEX_FILE +
                '?v=' +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                'tests/index.json नहीं मिली।'
            );

        }


        const data =
            await response.json();


        if (
            Array.isArray(data)
        ) {

            return data;

        }


        if (
            data &&
            Array.isArray(
                data.tests
            )
        ) {

            return data.tests;

        }


        return [];

    } catch (error) {

        console.error(
            'Test Index Error:',
            error
        );


        return [];

    }
}


/* =========================================================
   LOAD TEST FILE
========================================================= */

async function loadTestFile(
    file
) {

    try {

        const response =
            await fetch(
                file +
                '?v=' +
                Date.now()
            );


        if (!response.ok) {

            throw new Error(
                'File नहीं मिली: ' +
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
            ' से ' +
            questions.length +
            ' प्रश्न मिले।'
        );


        return questions;

    } catch (error) {

        console.error(
            'Test Load Error:',
            error
        );


        return [];

    }
}


/* =========================================================
   LOAD ALL TESTS
========================================================= */

async function loadAvailableTests() {

    availableTests = [];


    const indexData =
        await loadTestIndex();


    if (
        !indexData.length
    ) {

        console.warn(
            'tests/index.json में कोई Test नहीं मिला।'
        );


        setupAllSelectors();


        return;

    }


    for (
        const item of indexData
    ) {

        let file = '';

        let exam =
            'OTHER';

        let category =
            'GS';

        let subject =
            'General Studies';

        let title = '';

        let id = '';

        let questionsCount = 0;

        let timePerQuestion =
            DEFAULT_TIME_PER_QUESTION;

        let marks =
            DEFAULT_MARKS;

        let negativeMarking =
            DEFAULT_NEGATIVE_MARKING;

        let published =
            true;


        /*
           String format
        */

        if (
            typeof item ===
            'string'
        ) {

            file =
                item;

        }


        /*
           Object format
        */

        else if (
            item &&
            typeof item ===
            'object'
        ) {

            id =
                item.id ||
                '';


            file =
                item.file ||
                item.path ||
                item.url ||
                '';


            exam =
                item.exam ||
                'OTHER';


            category =
                item.category ||
                'GS';


            subject =
                item.subject ||
                'General Studies';


            title =
                item.name ||
                item.title ||
                '';


            questionsCount =
                Number(
                    item.questions
                ) || 0;


            timePerQuestion =
                Number(
                    item.timePerQuestion
                );


            if (
                !Number.isFinite(
                    timePerQuestion
                ) ||
                timePerQuestion <= 0
            ) {

                timePerQuestion =
                    DEFAULT_TIME_PER_QUESTION;

            }


            marks =
                Number(
                    item.marks
                );


            if (
                !Number.isFinite(
                    marks
                )
            ) {

                marks =
                    DEFAULT_MARKS;

            }


            negativeMarking =
                Number(
                    item.negativeMarking
                );


            if (
                !Number.isFinite(
                    negativeMarking
                ) ||
                negativeMarking < 0
            ) {

                negativeMarking =
                    DEFAULT_NEGATIVE_MARKING;

            }


            published =
                item.published !== false;

        }


        if (!file) {
            continue;
        }


        if (!published) {

            console.log(
                'Draft skipped:',
                title ||
                file
            );

            continue;

        }


        const questions =
            await loadTestFile(
                file
            );


        if (
            questions.length === 0
        ) {

            console.warn(
                'Questions नहीं मिले:',
                file
            );

            continue;

        }


        availableTests.push({

            id:
                id,

            file:
                file,

            exam:
                exam,

            category:
                category,

            subject:
                subject,

            title:
                title ||
                `${exam} ${subject}`,

            questions:
                questions,

            questionsCount:
                questionsCount ||
                questions.length,

            timePerQuestion:
                timePerQuestion,

            marks:
                marks,

            negativeMarking:
                negativeMarking,

            published:
                published

        });

    }


    console.log(
        'कुल Published Tests:',
        availableTests.length
    );


    setupAllSelectors();

    renderHomeExamGrid();
}


/* =========================================================
   UNIQUE VALUES
========================================================= */

function uniqueValues(
    values
) {

    return [
        ...new Set(
            values
                .filter(
                    value =>
                        value !==
                        undefined &&
                        value !==
                        null &&
                        String(value)
                            .trim() !== ''
                )
                .map(
                    value =>
                        String(value)
                            .trim()
                )
        )
    ];
}


/* =========================================================
   EXAM SELECTOR
========================================================= */

function setupExamSelector() {

    const selector =
        document.getElementById(
            'examSelect'
        );


    if (!selector) {
        return;
    }


    const exams =
        uniqueValues(
            [
                ...DEFAULT_EXAMS,
                ...availableTests.map(
                    item =>
                        item.exam
                )
            ]
        );


    selector.innerHTML =
        '<option value="">सभी Exams</option>';


    exams.forEach(
        exam => {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                exam;


            option.textContent =
                exam;


            selector.appendChild(
                option
            );

        }
    );


    if (
        currentExamFilter &&
        exams.includes(
            currentExamFilter
        )
    ) {

        selector.value =
            currentExamFilter;

    }
}


/* =========================================================
   CATEGORY SELECTOR
========================================================= */

function updateCategorySelector() {

    const examSelect =
        document.getElementById(
            'examSelect'
        );


    const categorySelect =
        document.getElementById(
            'categorySelect'
        );


    if (
        !examSelect ||
        !categorySelect
    ) {
        return;
    }


    currentExamFilter =
        examSelect.value;


    const filtered =
        availableTests.filter(
            item =>
                !currentExamFilter ||
                item.exam ===
                currentExamFilter
        );


    const categories =
        uniqueValues(
            filtered.map(
                item =>
                    item.category
            )
        );


    categorySelect.innerHTML =
        '<option value="">सभी Categories</option>';


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                category;


            option.textContent =
                category;


            categorySelect.appendChild(
                option
            );

        }
    );


    currentCategoryFilter =
        '';


    currentSubjectFilter =
        '';


    updateSubjectSelector();

}


/* =========================================================
   SUBJECT SELECTOR
========================================================= */

function updateSubjectSelector() {

    const categorySelect =
        document.getElementById(
            'categorySelect'
        );


    const subjectSelect =
        document.getElementById(
            'subjectSelect'
        );


    if (
        !categorySelect ||
        !subjectSelect
    ) {
        return;
    }


    currentCategoryFilter =
        categorySelect.value;


    const filtered =
        availableTests.filter(
            item => {

                const examMatch =
                    !currentExamFilter ||
                    item.exam ===
                    currentExamFilter;


                const categoryMatch =
                    !currentCategoryFilter ||
                    item.category ===
                    currentCategoryFilter;


                return (
                    examMatch &&
                    categoryMatch
                );

            }
        );


    const subjects =
        uniqueValues(
            filtered.map(
                item =>
                    item.subject
            )
        );


    subjectSelect.innerHTML =
        '<option value="">सभी Subjects</option>';


    subjects.forEach(
        subject => {

            const option =
                document.createElement(
                    'option'
                );


            option.value =
                subject;


            option.textContent =
                subject;


            subjectSelect.appendChild(
                option
            );

        }
    );


    currentSubjectFilter =
        '';


    updateTestSelector();

}


/* =========================================================
   TEST SELECTOR
========================================================= */

function updateTestSelector() {

    const subjectSelect =
        document.getElementById(
            'subjectSelect'
        );


    const testSelect =
        document.getElementById(
            'testSelect'
        );


    if (
        !subjectSelect ||
        !testSelect
    ) {
        return;
    }


    currentSubjectFilter =
        subjectSelect.value;


    const filtered =
        availableTests.filter(
            item => {

                const examMatch =
                    !currentExamFilter ||
                    item.exam ===
                    currentExamFilter;


                const categoryMatch =
                    !currentCategoryFilter ||
                    item.category ===
                    currentCategoryFilter;


                const subjectMatch =
                    !currentSubjectFilter ||
                    item.subject ===
                    currentSubjectFilter;


                return (
                    examMatch &&
                    categoryMatch &&
                    subjectMatch
                );

            }
        );


    testSelect.innerHTML =
        '<option value="">Test चुनें</option>';


    filtered.forEach(
        item => {

            const index =
                availableTests.indexOf(
                    item
                );


            const option =
                document.createElement(
                    'option'
                );


            option.value =
                String(index);


            option.textContent =
                `${item.title} — ${item.questions.length} प्रश्न`;


            testSelect.appendChild(
                option
            );

        }
    );


    showSelectedTestInfo();

}


/* =========================================================
   SETUP ALL SELECTORS
========================================================= */

function setupAllSelectors() {

    setupExamSelector();

    updateCategorySelector();

    setupCountOptions();

}


/* =========================================================
   SELECTED TEST INFO
========================================================= */

function showSelectedTestInfo() {

    const select =
        document.getElementById(
            'testSelect'
        );


    const info =
        document.getElementById(
            'selectedTestInfo'
        );


    if (
        !select ||
        !info
    ) {
        return;
    }


    const index =
        Number(
            select.value
        );


    const item =
        availableTests[index];


    if (!item) {

        info.innerHTML =
            'Exam → Category → Subject → Test Select करें।';

        return;

    }


    const totalTime =
        calculateTotalTimeForItem(
            item,
            item.questions.length
        );


    info.innerHTML = `

        <strong>
            ${escapeHtml(
                item.title
            )}
        </strong>

        <p>
            ${escapeHtml(
                item.exam
            )}
            •
            ${escapeHtml(
                item.category
            )}
            •
            ${escapeHtml(
                item.subject
            )}
        </p>

        <p>
            प्रश्न:
            <strong>
                ${item.questions.length}
            </strong>

            |

            प्रति प्रश्न:
            <strong>
                ${item.timePerQuestion} सेकंड
            </strong>

            |

            समय:
            <strong>
                ${formatDuration(totalTime)}
            </strong>
        </p>

        <p>
            Marks:
            <strong>
                +${item.marks}
            </strong>

            |

            Negative:
            <strong>
                ${item.negativeMarking}
            </strong>
        </p>

    `;

}


/* =========================================================
   CALCULATE ITEM TIME
========================================================= */

function calculateTotalTimeForItem(
    item,
    count
) {

    const seconds =
        Number(
            item?.timePerQuestion
        );


    return (
        count *
        (
            Number.isFinite(
                seconds
            ) &&
            seconds > 0
                ? seconds
                : DEFAULT_TIME_PER_QUESTION
        )
    );
}


/* =========================================================
   HOME EXAM GRID
========================================================= */

function renderHomeExamGrid() {

    const grid =
        document.getElementById(
            'homeExamGrid'
        );


    if (!grid) {
        return;
    }


    const exams =
        uniqueValues(
            [
                ...DEFAULT_EXAMS,
                ...availableTests.map(
                    item =>
                        item.exam
                )
            ]
        );


    grid.innerHTML = '';


    exams.forEach(
        exam => {

            const count =
                availableTests.filter(
                    item =>
                        item.exam ===
                        exam
                ).length;


            const button =
                document.createElement(
                    'button'
                );


            button.type =
                'button';


            button.innerHTML = `

                <strong>
                    ${escapeHtml(exam)}
                </strong>

                <span>
                    ${count}
                    Published Test
                    ${count === 1 ? '' : 's'}
                </span>

            `;


            button.onclick =
                () => openExam(exam);


            grid.appendChild(
                button
            );

        }
    );
}


/* =========================================================
   OPEN EXAM
========================================================= */

function openExam(
    exam
) {

    currentExamFilter =
        exam;


    currentCategoryFilter =
        '';


    currentSubjectFilter =
        '';


    showPage('tests');


    const examSelect =
        document.getElementById(
            'examSelect'
        );


    if (examSelect) {

        examSelect.value =
            exam;

    }


    updateCategorySelector();

}


/* =========================================================
   OLD COMPATIBILITY
========================================================= */

function startExamTest(
    exam
) {

    openExam(exam);

}


/* =========================================================
   START TEST
========================================================= */

async function startTest() {

    clearInterval(
        timerId
    );


    test = [];

    current = 0;

    score = 0;

    timeLeft = 0;

    selectedAnswers = [];

    markedQuestions = [];


    testStartedAt =
        Date.now();


    if (
        availableTests.length ===
        0
    ) {

        await loadAvailableTests();

    }


    if (
        availableTests.length ===
        0
    ) {

        alert(
            'कोई Published Test उपलब्ध नहीं है।\n\n' +
            'tests/index.json और TXT files जाँचें।'
        );


        return;

    }


    const selector =
        document.getElementById(
            'testSelect'
        );


    if (
        !selector ||
        selector.value === ''
    ) {

        alert(
            'कृपया पहले Test Select करें।'
        );


        return;

    }


    const testIndex =
        Number(
            selector.value
        );


    currentTestInfo =
        availableTests[
            testIndex
        ];


    if (!currentTestInfo) {

        alert(
            'Test नहीं मिला।'
        );


        return;

    }


    const countElement =
        document.getElementById(
            'count'
        );


    let requestedCount =
        MAX_QUESTIONS;


    if (
        countElement &&
        countElement.value
    ) {

        requestedCount =
            Number(
                countElement.value
            );

    }


    if (
        !Number.isFinite(
            requestedCount
        )
    ) {

        requestedCount =
            MAX_QUESTIONS;

    }


    requestedCount =
        Math.max(
            1,
            Math.min(
                requestedCount,
                MAX_QUESTIONS
            )
        );


    const availableQuestions =
        currentTestInfo.questions;


    const count =
        Math.min(
            requestedCount,
            availableQuestions.length
        );


    test =
        shuffle(
            availableQuestions
        ).slice(
            0,
            count
        );


    if (
        test.length ===
        0
    ) {

        alert(
            'इस Test में प्रश्न उपलब्ध नहीं हैं।'
        );


        return;

    }


    selectedAnswers =
        new Array(
            test.length
        );


    markedQuestions =
        new Array(
            test.length
        ).fill(false);


    testTimeLimit =
        calculateTotalTime(
            test.length
        );


    timeLeft =
        testTimeLimit;


    const testArea =
        document.getElementById(
            'testArea'
        );


    const result =
        document.getElementById(
            'resultArea'
        );


    if (testArea) {

        testArea.classList.remove(
            'hidden'
        );

    }


    if (result) {

        result.classList.add(
            'hidden'
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


                    timeLeft =
                        0;


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
   SHUFFLE
========================================================= */

function shuffle(
    array
) {

    const result =
        [...array];


    for (
        let i =
            result.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() *
                (i + 1)
            );


        [
            result[i],
            result[j]
        ] =
        [
            result[j],
            result[i]
        ];

    }


    return result;
}


/* =========================================================
   TIMER
========================================================= */

function updateTimer() {

    const timer =
        document.getElementById(
            'timer'
        );


    if (!timer) {
        return;
    }


    timeLeft =
        Math.max(
            0,
            timeLeft
        );


    const minutes =
        Math.floor(
            timeLeft / 60
        )
        .toString()
        .padStart(
            2,
            '0'
        );


    const seconds =
        (
            timeLeft %
            60
        )
        .toString()
        .padStart(
            2,
            '0'
        );


    timer.textContent =
        '⏱️ ' +
        minutes +
        ':' +
        seconds;


    timer.classList.toggle(
        'danger',
        timeLeft <= 10
    );
}


/* =========================================================
   RENDER QUESTION
========================================================= */

function renderQuestion() {

    const question =
        test[current];


    const area =
        document.getElementById(
            'testArea'
        );


    if (
        !area ||
        !question
    ) {

        return;

    }


    let html = '';


    html += `

        <div class="test-header">

            <div>

                <strong>
                    ${escapeHtml(
                        currentTestInfo?.exam ||
                        'GS'
                    )}
                </strong>

                <span>
                    •
                    ${escapeHtml(
                        currentTestInfo?.category ||
                        ''
                    )}
                </span>

                <span>
                    •
                    ${escapeHtml(
                        currentTestInfo?.subject ||
                        ''
                    )}
                </span>

            </div>


            <div class="timer-box">

                <span
                    id="timer"
                    class="timer">

                </span>

            </div>

        </div>


        <div class="test-info">

            <strong>
                ${escapeHtml(
                    currentTestInfo?.title ||
                    'GS Test'
                )}
            </strong>

            <span>
                प्रति प्रश्न:
                ${getTimePerQuestion()}
                सेकंड
            </span>

            <span>
                सही:
                +${getMarks()}
            </span>

            ${
                getNegativeMarking() > 0
                    ? `
                        <span>
                            गलत:
                            -${getNegativeMarking()}
                        </span>
                      `
                    : ''
            }

        </div>


        <div class="progress">

            प्रश्न
            ${current + 1}
            /
            ${test.length}

        </div>


        <div class="question-card">

            <div class="question-text">

                <h3>
                    ${escapeHtml(
                        question.q
                    ).replace(
                        /\n/g,
                        '<br>'
                    )}
                </h3>

            </div>

    `;


    question.o.forEach(
        (
            option,
            index
        ) => {

            const selected =
                selectedAnswers[
                    current
                ] === index
                    ? 'selected'
                    : '';


            html += `

                <button
                    type="button"
                    class="option ${selected}"
                    onclick="answer(${index})">

                    <span class="option-letter">

                        ${String.fromCharCode(
                            65 + index
                        )}

                    </span>

                    <span>

                        ${escapeHtml(
                            option
                        )}

                    </span>

                </button>

            `;

        }
    );


    html += `
        </div>
    `;


    html += `

        <div class="test-nav">

            <button
                type="button"
                onclick="prevQuestion()"
                ${current === 0 ? 'disabled' : ''}>

                ⬅️ पिछला

            </button>


            <button
                type="button"
                onclick="skipQuestion()">

                ⏭️ Skip

            </button>


            <button
                type="button"
                onclick="nextQuestion()">

                ${
                    current ===
                    test.length - 1
                        ? '🏁 समाप्त करें'
                        : 'अगला ➡️'
                }

            </button>

        </div>


        <div class="mark-area">

            <button
                type="button"
                onclick="toggleMark()">

                ${
                    markedQuestions[
                        current
                    ]
                        ? '⭐ Mark हटाएँ'
                        : '☆ प्रश्न Mark करें'
                }

            </button>

        </div>


        <div class="palette-title">

            प्रश्न सूची

        </div>


        <div class="palette">

    `;


    test.forEach(
        (
            _,
            index
        ) => {

            let classes = '';


            if (
                index === current
            ) {

                classes +=
                    'current ';

            }


            if (
                selectedAnswers[
                    index
                ] !== undefined
            ) {

                classes +=
                    'answered ';

            }


            if (
                markedQuestions[
                    index
                ]
            ) {

                classes +=
                    'marked ';

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
   ANSWER
========================================================= */

function answer(
    number
) {

    if (
        number < 0 ||
        number > 3
    ) {

        return;

    }


    selectedAnswers[
        current
    ] =
        number;


    renderQuestion();
}


/* =========================================================
   NEXT
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
   PREVIOUS
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
   GO QUESTION
========================================================= */

function goQuestion(
    index
) {

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
   MARK QUESTION
========================================================= */

function toggleMark() {

    markedQuestions[
        current
    ] =
        !markedQuestions[
            current
        ];


    renderQuestion();
}


/* =========================================================
   FINISH TEST
========================================================= */

function finishTest(
    timeout = false
) {

    if (
        test.length === 0
    ) {

        return;

    }


    clearInterval(
        timerId
    );


    let correct = 0;

    let wrong = 0;

    let attempted = 0;


    selectedAnswers.forEach(
        (
            answerValue,
            index
        ) => {

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

                    correct++;

                } else {

                    wrong++;

                }

            }

        }
    );


    const total =
        test.length;


    const unanswered =
        total -
        attempted;


    const marksPerQuestion =
        getMarks();


    const negative =
        getNegativeMarking();


    const positiveMarks =
        correct *
        marksPerQuestion;


    const negativeMarks =
        wrong *
        negative;


    const finalScore =
        positiveMarks -
        negativeMarks;


    score =
        Number(
            finalScore.toFixed(2)
        );


    const maximumMarks =
        total *
        marksPerQuestion;


    const accuracy =
        attempted > 0
            ? Math.round(
                (
                    correct /
                    attempted
                ) *
                100
              )
            : 0;


    const timeTaken =
        Math.max(
            0,
            testTimeLimit -
            timeLeft
        );


    const resultData = {

        student:
            getStudentName(),

        exam:
            currentTestInfo?.exam ||
            'GS',

        category:
            currentTestInfo?.category ||
            'GS',

        subject:
            currentTestInfo?.subject ||
            'GS',

        test:
            currentTestInfo?.title ||
            'GS Test',

        testId:
            currentTestInfo?.id ||
            '',

        score:
            score,

        maximumMarks:
            maximumMarks,

        total:
            total,

        attempted:
            attempted,

        correct:
            correct,

        wrong:
            wrong,

        unanswered:
            unanswered,

        accuracy:
            accuracy,

        marksPerQuestion:
            marksPerQuestion,

        negativeMarking:
            negative,

        timePerQuestion:
            getTimePerQuestion(),

        timeTaken:
            timeTaken,

        timeRemaining:
            timeLeft,

        date:
            new Date()
                .toLocaleString(
                    'hi-IN'
                )

    };


    const testArea =
        document.getElementById(
            'testArea'
        );


    if (testArea) {

        testArea.classList.add(
            'hidden'
        );

    }


    const result =
        document.getElementById(
            'resultArea'
        );


    if (!result) {
        return;
    }


    result.classList.remove(
        'hidden'
    );


    result.innerHTML = `

        <div class="result-card">

            <div class="score">
                🏆 Test Complete
            </div>


            <h2>
                ${escapeHtml(
                    resultData.student
                )}
            </h2>


            <h3>
                ${escapeHtml(
                    resultData.test
                )}
            </h3>


            <div class="result-score">

                ${score}
                /
                ${maximumMarks}

            </div>


            <p>
                📚 कुल प्रश्न:
                <strong>${total}</strong>
            </p>


            <p>
                📝 Attempted:
                <strong>${attempted}</strong>
            </p>


            <p>
                ✅ सही:
                <strong>${correct}</strong>
            </p>


            <p>
                ❌ गलत:
                <strong>${wrong}</strong>
            </p>


            <p>
                ⭕ अनुत्तरित:
                <strong>${unanswered}</strong>
            </p>


            <p>
                🎯 Accuracy:
                <strong>${accuracy}%</strong>
            </p>


            <p>
                ➕ प्रति सही:
                <strong>${marksPerQuestion}</strong>
            </p>


            <p>
                ➖ Negative:
                <strong>${negative}</strong>
            </p>


            <p>
                ⏱️ प्रति प्रश्न:
                <strong>
                    ${getTimePerQuestion()}
                    सेकंड
                </strong>
            </p>


            <p>
                ⌛ समय लिया:
                <strong>
                    ${formatDuration(
                        timeTaken
                    )}
                </strong>
            </p>


            <p>
                ⏳ समय बचा:
                <strong>
                    ${formatDuration(
                        timeLeft
                    )}
                </strong>
            </p>


            ${
                timeout
                    ? `
                        <p class="timeout">
                            ⏰ समय समाप्त हो गया।
                        </p>
                      `
                    : ''
            }


            <hr>


            <button
                type="button"
                onclick="showAnswerReview()">

                📖 Answer Explanation

            </button>


            <button
                type="button"
                onclick="resetTest()">

                🔄 फिर से Test दें

            </button>


            <button
                type="button"
                onclick="showPage('home')">

                🏠 Home

            </button>

        </div>

    `;


    localStorage.setItem(
        'lastScore',
        JSON.stringify(
            resultData
        )
    );


    saveResultHistory(
        resultData
    );


    updateStudentProfile();
}


/* =========================================================
   ANSWER REVIEW
========================================================= */

function showAnswerReview() {

    const result =
        document.getElementById(
            'resultArea'
        );


    if (!result) {
        return;
    }


    let html = `

        <div class="result-card">

            <h2>
                📖 Answer Review
            </h2>

    `;


    test.forEach(
        (
            question,
            index
        ) => {

            const studentAnswer =
                selectedAnswers[
                    index
                ];


            const correctAnswer =
                question.a;


            let status;


            if (
                studentAnswer ===
                undefined
            ) {

                status =
                    '⭕ अनुत्तरित';

            } else if (
                studentAnswer ===
                correctAnswer
            ) {

                status =
                    '✅ सही';

            } else {

                status =
                    '❌ गलत';

            }


            html += `

                <div class="history-item">

                    <h3>
                        प्रश्न ${index + 1}
                    </h3>


                    <p>

                        <strong>
                            ${escapeHtml(
                                question.q
                            )}
                        </strong>

                    </p>


                    <p>
                        स्थिति:
                        <strong>
                            ${status}
                        </strong>
                    </p>


                    <p>
                        आपका उत्तर:
                        <strong>

                            ${
                                studentAnswer !==
                                undefined

                                    ? String.fromCharCode(
                                        65 +
                                        studentAnswer
                                      )

                                    : 'नहीं दिया'

                            }

                        </strong>
                    </p>


                    <p>
                        सही उत्तर:
                        <strong>

                            ${String.fromCharCode(
                                65 +
                                correctAnswer
                            )}

                        </strong>
                    </p>


                    <div>

                        ${question.o.map(
                            (
                                option,
                                optionIndex
                            ) => `

                                <p>

                                    <strong>
                                        ${String.fromCharCode(
                                            65 +
                                            optionIndex
                                        )}.
                                    </strong>

                                    ${escapeHtml(
                                        option
                                    )}

                                </p>

                            `
                        ).join('')}

                    </div>

                </div>

            `;

        }
    );


    html += `

            <button
                type="button"
                onclick="resetTest()">

                🔄 फिर से Test दें

            </button>


            <button
                type="button"
                onclick="showPage('home')">

                🏠 Home

            </button>

        </div>

    `;


    result.innerHTML =
        html;


    result.classList.remove(
        'hidden'
    );
}


/* =========================================================
   RESULT HISTORY
========================================================= */

function saveResultHistory(
    resultData
) {

    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    'testHistory'
                ) || '[]'
            );


        if (
            !Array.isArray(
                history
            )
        ) {

            history = [];

        }

    } catch {

        history = [];

    }


    history.unshift(
        resultData
    );


    history =
        history.slice(
            0,
            50
        );


    localStorage.setItem(
        'testHistory',
        JSON.stringify(
            history
        )
    );
}


/* =========================================================
   SHOW RESULTS
========================================================= */

function showResults() {

    const result =
        document.getElementById(
            'resultArea'
        );


    if (!result) {
        return;
    }


    let history = [];


    try {

        history =
            JSON.parse(
                localStorage.getItem(
                    'testHistory'
                ) || '[]'
            );


    } catch {

        history = [];

    }


    if (
        !Array.isArray(history) ||
        history.length === 0
    ) {

        result.innerHTML = `

            <div class="result-card">

                <h2>
                    🏆 Test Result
                </h2>

                <p>
                    अभी कोई Test Result उपलब्ध नहीं है।
                </p>

            </div>

        `;


        result.classList.remove(
            'hidden'
        );


        return;
    }


    let html = `

        <div class="result-card">

            <h2>
                🏆 Test Result History
            </h2>

    `;


    history.forEach(
        item => {

            html += `

                <div class="history-item">

                    <strong>
                        ${escapeHtml(
                            item.test ||
                            'GS Test'
                        )}
                    </strong>


                    <p>

                        ${escapeHtml(
                            item.exam ||
                            ''
                        )}

                        •

                        ${escapeHtml(
                            item.category ||
                            ''
                        )}

                        •

                        ${escapeHtml(
                            item.subject ||
                            ''
                        )}

                    </p>


                    <p>

                        Score:
                        ${item.score}
                        /
                        ${item.maximumMarks}

                        |

                        Accuracy:
                        ${item.accuracy}%

                    </p>


                    <p>

                        सही:
                        ${item.correct}

                        |

                        गलत:
                        ${item.wrong}

                        |

                        Unanswered:
                        ${item.unanswered}

                    </p>


                    <small>
                        ${escapeHtml(
                            item.date ||
                            ''
                        )}
                    </small>

                </div>

            `;

        }
    );


    html += `
        </div>
    `;


    result.innerHTML =
        html;


    result.classList.remove(
        'hidden'
    );
}


/* =========================================================
   RESET TEST
========================================================= */

function resetTest() {

    clearInterval(
        timerId
    );


    test = [];

    current = 0;

    score = 0;

    timeLeft = 0;

    testTimeLimit = 0;

    selectedAnswers = [];

    markedQuestions = [];

    currentTestInfo = null;

    testStartedAt = null;


    const result =
        document.getElementById(
            'resultArea'
        );


    const testArea =
        document.getElementById(
            'testArea'
        );


    if (result) {

        result.classList.add(
            'hidden'
        );

    }


    if (testArea) {

        testArea.classList.add(
            'hidden'
        );

    }


    showPage('tests');


    setupCountOptions();

}


/* =========================================================
   TXT FILE UPLOAD
========================================================= */

function setupFileUpload() {

    const fileInput =
        document.getElementById(
            'txtFile'
        );


    if (!fileInput) {
        return;
    }


    fileInput.addEventListener(
        'change',
        async function () {

            const file =
                this.files &&
                this.files[0];


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
                        'इस TXT में सही format के प्रश्न नहीं मिले।'
                    );


                    return;

                }


                availableTests.push({

                    id:
                        'custom-' +
                        Date.now(),

                    file:
                        file.name,

                    exam:
                        'CUSTOM',

                    category:
                        'GS',

                    subject:
                        'General Studies',

                    title:
                        file.name,

                    questions:
                        questions,

                    questionsCount:
                        questions.length,

                    timePerQuestion:
                        DEFAULT_TIME_PER_QUESTION,

                    marks:
                        DEFAULT_MARKS,

                    negativeMarking:
                        DEFAULT_NEGATIVE_MARKING,

                    published:
                        true

                });


                setupAllSelectors();

                renderHomeExamGrid();


                alert(

                    file.name +
                    ' सफलतापूर्वक Load हुआ।\n\n' +
                    questions.length +
                    ' प्रश्न मिले।'

                );


            } catch (error) {

                console.error(
                    error
                );


                alert(
                    'TXT file पढ़ने में समस्या हुई।'
                );

            }

        }
    );
}


/* =========================================================
   ADMIN ACTION
========================================================= */

function adminAction(
    type
) {

    if (!isAdmin()) {

        alert(
            'Admin access required.'
        );


        showPage(
            'loginPage'
        );


        return;

    }


    const message =
        document.getElementById(
            'adminMessage'
        );


    if (!message) {
        return;
    }


    const labels = {

        tests:
            '📝 Test Management',

        questions:
            '❓ Question Bank',

        students:
            '👨‍🎓 Student Management',

        notes:
            '📄 Notes / PDF',

        notifications:
            '🔔 Notifications',

        links:
            '🔗 Social Links',

        courses:
            '📚 Courses',

        settings:
            '⚙️ App Settings'

    };


    message.innerHTML = `

        <h3>
            ${labels[type] || 'Admin'}
        </h3>

        <p>
            यह Admin Module अगले development
            चरण में activate किया जाएगा।
        </p>

        <p>
            मौजूदा Test System सुरक्षित है।
        </p>

    `;


    message.classList.remove(
        'hidden'
    );
}


/* =========================================================
   LAST RESULT
========================================================= */

function showLastResult() {

    const result =
        document.getElementById(
            'resultArea'
        );


    if (!result) {
        return;
    }


    const saved =
        localStorage.getItem(
            'lastScore'
        );


    if (!saved) {

        result.innerHTML = `

            <div class="result-card">

                <h2>
                    🏆 Test Result
                </h2>

                <p>
                    अभी कोई Result उपलब्ध नहीं है।
                </p>

            </div>

        `;


        result.classList.remove(
            'hidden'
        );


        return;
    }


    let data;


    try {

        data =
            JSON.parse(
                saved
            );

    } catch {

        data = null;

    }


    if (!data) {
        return;
    }


    result.innerHTML = `

        <div class="result-card">

            <h2>
                🏆 Last Test Result
            </h2>


            <h3>
                ${escapeHtml(
                    data.test ||
                    'GS Test'
                )}
            </h3>


            <p>
                👤
                ${escapeHtml(
                    data.student ||
                    'Student'
                )}
            </p>


            <div class="result-score">

                ${data.score}
                /
                ${data.maximumMarks}

            </div>


            <p>
                🎯 Accuracy:
                ${data.accuracy}%
            </p>


            <p>
                ✅ Correct:
                ${data.correct}
            </p>


            <p>
                ❌ Wrong:
                ${data.wrong}
            </p>


            <p>
                ⭕ Unanswered:
                ${data.unanswered}
            </p>


            <p>
                📅
                ${escapeHtml(
                    data.date ||
                    ''
                )}
            </p>

        </div>

    `;


    result.classList.remove(
        'hidden'
    );
}


/* =========================================================
   PAGE LOAD
========================================================= */

window.addEventListener(
    'DOMContentLoaded',
    async () => {

        const savedName =
            localStorage.getItem(
                'gsName'
            );


        const nameInput =
            document.getElementById(
                'name'
            );


        if (
            savedName &&
            nameInput
        ) {

            nameInput.value =
                savedName;

        }


        setupCountOptions();


        await loadAvailableTests();


        setupFileUpload();


        updateStudentProfile();


        /*
           Role based initial interface
        */

        const userType =
            getUserType();


        if (
            userType ===
            'admin'
        ) {

            showPage(
                'adminPanel'
            );

        } else if (
            userType ===
            'student'
        ) {

            showPage(
                'home'
            );

        } else {

            showPage(
                'loginPage'
            );

        }


        /*
           PWA
        */

        if (
            'serviceWorker' in
            navigator
        ) {

            navigator.serviceWorker
                .register(
                    'service-worker.js'
                )
                .then(
                    registration => {

                        console.log(
                            'Service Worker registered:',
                            registration.scope
                        );

                    }
                )
                .catch(
                    error => {

                        console.log(
                            'Service Worker Error:',
                            error
                        );

                    }
                );

        }


        console.log(
            'GS Junction Prayagraj App Ready.'
        );

    }
);
