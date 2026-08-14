/* =========================================================
   GS JUNCTION PRAYAGRAJ
   ONLINE TEST SYSTEM - STABLE VERSION
   =========================================================
   Features:
   • tests/index.json से Tests Auto Load
   • Exam → Category → Subject → Test
   • PCS / UPSSSC / TGT / PGT / LT GRADE
   • UGC NET / TET / CTET
   • index.json से Timer / Marks / Negative Marking
   • Default 45 सेकंड प्रति प्रश्न
   • Previous / Next / Skip
   • Question Palette
   • Current / Answered / Unanswered / Marked
   • Score / Accuracy / Result
   • Student Name
   • LocalStorage Result History
   • TXT Question Parser
   • Numbered और Unnumbered TXT support
   • **1.** / 1. / 1) formats
   • Answer: (B) / उत्तर: (B)
   • Admin/Student Interface के लिए तैयार
   ========================================================= */

'use strict';

/* =========================================================
   GLOBAL VARIABLES
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


/* =========================================================
   SETTINGS
   ========================================================= */

const TIME_PER_QUESTION = 45;
const MAX_QUESTIONS = 150;

const TEST_INDEX_FILE = 'tests/index.json';


/* =========================================================
   EXAM CATEGORIES
   ========================================================= */

const EXAMS = [
    'PCS',
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

function show(id) {

    document.querySelectorAll('main section').forEach(section => {
        section.classList.remove('active');
    });

    const element = document.getElementById(id);

    if (element) {
        element.classList.add('active');
    }

    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });

    closeMobileNav();
}


/* =========================================================
   MOBILE NAVIGATION
   ========================================================= */

function toggleNav() {

    const nav = document.getElementById('nav');

    if (nav) {
        nav.classList.toggle('open');
    }
}


function closeMobileNav() {

    const nav = document.getElementById('nav');

    if (nav) {
        nav.classList.remove('open');
    }
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
   SAVE STUDENT NAME
   ========================================================= */

function saveName() {

    const input = document.getElementById('name');
    const msg = document.getElementById('msg');

    const name = input
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
            'प्रोफाइल सुरक्षित: ' + name;
    }
}


/* =========================================================
   GET STUDENT NAME
   ========================================================= */

function getStudentName() {

    const input =
        document.getElementById('name');

    if (
        input &&
        input.value.trim()
    ) {
        return input.value.trim();
    }

    return (
        localStorage.getItem('gsName') ||
        'Student'
    );
}


/* =========================================================
   QUESTION COUNT OPTIONS
   ========================================================= */

function setupCountOptions() {

    const countSelect =
        document.getElementById('count');

    if (!countSelect) {
        return;
    }

    countSelect.innerHTML = '';

    const options = [
        5,
        10,
        20,
        30,
        50,
        75,
        100,
        150
    ];

    options.forEach(number => {

        const option =
            document.createElement('option');

        option.value = String(number);

        option.textContent =
            number + ' प्रश्न';

        countSelect.appendChild(option);
    });

    countSelect.value = '150';
}


/* =========================================================
   GET CURRENT TEST SETTINGS
   ========================================================= */

function getTimePerQuestion() {

    const value =
        Number(
            currentTestInfo?.timePerQuestion
        );

    return (
        Number.isFinite(value) &&
        value > 0
    )
        ? value
        : TIME_PER_QUESTION;
}


function getMarksPerQuestion() {

    const value =
        Number(
            currentTestInfo?.marks
        );

    return Number.isFinite(value)
        ? value
        : 1;
}


function getNegativeMarking() {

    const value =
        Number(
            currentTestInfo?.negativeMarking
        );

    return Number.isFinite(value)
        ? value
        : 0;
}


/* =========================================================
   TOTAL TIME
   ========================================================= */

function calculateTotalTime(
    count,
    timePerQuestion = TIME_PER_QUESTION
) {

    const q =
        Number(count) || 0;

    const time =
        Number(timePerQuestion);

    return (
        q *
        (
            Number.isFinite(time) &&
            time > 0
                ? time
                : TIME_PER_QUESTION
        )
    );
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatDuration(seconds) {

    seconds = Math.max(
        0,
        Number(seconds) || 0
    );

    const hours =
        Math.floor(seconds / 3600);

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
   HTML ESCAPE
   ========================================================= */

function escapeHtml(value) {

    return String(value ?? '').replace(
        /[&<>"']/g,
        character => {

            const map = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#039;'
            };

            return map[character];
        }
    );
}


/* =========================================================
   CLEAN TEXT
   ========================================================= */

function cleanText(text) {

    if (!text) {
        return '';
    }

    return String(text)
        .replace(/\r/g, '')
        .replace(/\*\*/g, '')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/[ \t]+/g, ' ')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}


/* =========================================================
   NORMALIZE ANSWER
   ========================================================= */

function parseAnswer(text) {

    if (!text) {
        return -1;
    }

    const patterns = [

        /(?:उत्तर|answer|correct\s*answer)\s*[:\-]?\s*\(?\s*([A-D])\s*\)?/i,

        /\b(?:उत्तर|answer)\s*[:\-]?\s*\[?\s*([A-D])\s*\]?/i

    ];

    for (const pattern of patterns) {

        const match =
            String(text).match(pattern);

        if (match) {

            return (
                match[1]
                    .toUpperCase()
                    .charCodeAt(0) - 65
            );
        }
    }

    return -1;
}


/* =========================================================
   PARSE TXT QUESTIONS
   =========================================================
   Supported:

   **1.** Question
   1. Question
   1) Question

   (A) Option
   (B) Option
   (C) Option
   (D) Option

   **उत्तर: (B)**
   उत्तर: (B)
   Answer: B
   ========================================================= */

function parseQuestions(text) {

    if (!text) {
        return [];
    }

    text =
        String(text)
            .replace(/\r/g, '')
            .replace(/\u00A0/g, ' ');

    /*
       Markdown headings हटाएँ
    */

    text =
        text.replace(
            /^#{1,6}\s+.*$/gm,
            ''
        );

    /*
       Question number detection
    */

    const questionRegex =
        /(?:^|\n)\s*(?:\*\*)?\s*(\d{1,3})\s*[\.\)]\s*(?:\*\*)?\s*/g;

    const matches = [];

    let match;

    while (
        (match =
            questionRegex.exec(text)) !== null
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

    /*
       यदि numbered format मिला
    */

    if (matches.length > 0) {

        return parseNumberedQuestions(
            text,
            matches
        );
    }

    /*
       यदि numbering नहीं है,
       तो blocks से प्रश्न पहचानें
    */

    return parseUnnumberedQuestions(text);
}


/* =========================================================
   PARSE NUMBERED QUESTIONS
   ========================================================= */

function parseNumberedQuestions(
    text,
    matches
) {

    const questions = [];

    for (
        let i = 0;
        i < matches.length;
        i++
    ) {

        const start =
            matches[i].contentStart;

        const end =
            i + 1 < matches.length
                ? matches[i + 1].start
                : text.length;

        const block =
            text
                .slice(start, end)
                .trim();

        if (!block) {
            continue;
        }

        const parsed =
            parseQuestionBlock(block);

        if (parsed) {

            questions.push({
                ...parsed,
                number:
                    matches[i].number
            });
        }
    }

    return questions;
}


/* =========================================================
   PARSE UNNUMBERED QUESTIONS
   ========================================================= */

function parseUnnumberedQuestions(text) {

    const questions = [];

    /*
       पहले Answer lines के आधार पर blocks
       identify करने की कोशिश
    */

    const blocks =
        text
            .split(
                /(?=(?:^|\n)\s*(?:उत्तर|answer|correct\s*answer)\s*[:\-])/i
            )
            .map(block => block.trim())
            .filter(Boolean);

    /*
       यदि ऊपर से usable blocks नहीं मिले,
       तो पूरे text को parse करने की कोशिश
    */

    for (const block of blocks) {

        const parsed =
            parseQuestionBlock(
                block
            );

        if (parsed) {
            questions.push(parsed);
        }
    }

    /*
       Alternative:
       Question + Options + Answer वाले
       paragraph blocks
    */

    if (questions.length === 0) {

        const answerRegex =
            /(?:उत्तर|answer|correct\s*answer)\s*[:\-]?\s*\(?\s*([A-D])\s*\)?/gi;

        let answerMatch;

        const answerMatches = [];

        while (
            (answerMatch =
                answerRegex.exec(text)) !== null
        ) {

            answerMatches.push({
                index:
                    answerMatch.index,

                end:
                    answerRegex.lastIndex,

                answer:
                    answerMatch[1]
                        .toUpperCase()
                        .charCodeAt(0) - 65
            });
        }

        /*
           हर answer से पहले संभावित question block
        */

        for (
            let i = 0;
            i < answerMatches.length;
            i++
        ) {

            const previousEnd =
                i === 0
                    ? 0
                    : answerMatches[i - 1].end;

            const start =
                previousEnd;

            const end =
                answerMatches[i].end;

            const block =
                text
                    .slice(
                        start,
                        end
                    )
                    .trim();

            const parsed =
                parseQuestionBlock(
                    block
                );

            if (parsed) {
                questions.push(parsed);
            }
        }
    }

    return questions;
}


/* =========================================================
   PARSE ONE QUESTION BLOCK
   ========================================================= */

function parseQuestionBlock(block) {

    if (!block) {
        return null;
    }

    let answer =
        parseAnswer(block);

    if (answer < 0) {
        return null;
    }

    /*
       Answer line हटाएँ
    */

    let questionPart =
        block.replace(
            /(?:उत्तर|answer|correct\s*answer)\s*[:\-]?\s*\(?\s*[A-D]\s*\)?[^\n]*/gi,
            ''
        ).trim();

    /*
       Option detection
    */

    const optionRegex =
        /(?:^|\n|\s)(?:\*\*)?\s*\(([ABCD])\)\s*(?:\*\*)?\s*/gi;

    const optionMatches = [];

    let optionMatch;

    while (
        (optionMatch =
            optionRegex.exec(
                questionPart
            )) !== null
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
       Fallback:
       A) B) C) D)
    */

    if (
        optionMatches.length < 4
    ) {

        optionMatches.length = 0;

        const alternativeRegex =
            /(?:^|\n|\s)(?:\*\*)?\s*([ABCD])[\.\)]\s*(?:\*\*)?\s*/gi;

        while (
            (optionMatch =
                alternativeRegex.exec(
                    questionPart
                )) !== null
        ) {

            optionMatches.push({

                letter:
                    optionMatch[1]
                        .toUpperCase(),

                index:
                    optionMatch.index,

                contentStart:
                    alternativeRegex.lastIndex
            });
        }
    }

    if (
        optionMatches.length < 4
    ) {
        return null;
    }

    /*
       Question text
    */

    const questionText =
        cleanText(
            questionPart.slice(
                0,
                optionMatches[0].index
            )
        );

    if (!questionText) {
        return null;
    }

    /*
       Options
    */

    const options = [];

    for (
        let j = 0;
        j < optionMatches.length &&
        options.length < 4;
        j++
    ) {

        const optionStart =
            optionMatches[j]
                .contentStart;

        const optionEnd =
            j + 1 < optionMatches.length
                ? optionMatches[j + 1].index
                : questionPart.length;

        const optionText =
            cleanText(
                questionPart.slice(
                    optionStart,
                    optionEnd
                )
            );

        options.push(
            optionText
        );
    }

    if (
        options.length < 4 ||
        options.some(
            option => !option
        )
    ) {
        return null;
    }

    return {

        q:
            questionText,

        o:
            options,

        a:
            answer
    };
}


/* =========================================================
   LOAD JSON
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

        /*
           Array format
        */

        if (Array.isArray(data)) {
            return data;
        }

        /*
           Object format
        */

        if (
            data &&
            Array.isArray(data.tests)
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

async function loadTestFile(file) {

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
            parseQuestions(text);

        console.log(
            `${file} से ${questions.length} प्रश्न मिले।`
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
   AUTO LOAD TESTS FROM index.json
   ========================================================= */

async function loadAvailableTests() {

    availableTests = [];

    const indexData =
        await loadTestIndex();

    if (
        !indexData ||
        indexData.length === 0
    ) {

        console.warn(
            'tests/index.json में कोई Test नहीं मिला।'
        );

        setupTestSelector();

        return;
    }

    for (
        const item of indexData
    ) {

        if (
            !item ||
            typeof item !== 'object'
        ) {
            continue;
        }

        /*
           Draft / unpublished test
           Student को नहीं दिखेगा
        */

        if (
            item.published === false
        ) {
            continue;
        }

        const file =
            item.file ||
            item.path ||
            item.url ||
            '';

        if (!file) {
            continue;
        }

        const questions =
            await loadTestFile(file);

        if (
            questions.length === 0
        ) {

            console.warn(
                'इस Test में प्रश्न नहीं मिले:',
                file
            );

            continue;
        }

        /*
           index.json metadata
        */

        const testInfo = {

            id:
                item.id ||
                file,

            name:
                item.name ||
                item.title ||
                'Test',

            title:
                item.name ||
                item.title ||
                'Test',

            exam:
                item.exam ||
                'General',

            category:
                item.category ||
                'GS',

            subject:
                item.subject ||
                'General Studies',

            file:
                file,

            questions:
                questions,

            questionCount:
                Number(item.questions) > 0
                    ? Number(item.questions)
                    : questions.length,

            timePerQuestion:
                Number(item.timePerQuestion) > 0
                    ? Number(item.timePerQuestion)
                    : TIME_PER_QUESTION,

            marks:
                Number.isFinite(
                    Number(item.marks)
                )
                    ? Number(item.marks)
                    : 1,

            negativeMarking:
                Number.isFinite(
                    Number(item.negativeMarking)
                )
                    ? Number(item.negativeMarking)
                    : 0,

            published:
                item.published !== false
        };

        availableTests.push(
            testInfo
        );
    }

    console.log(
        'कुल उपलब्ध Published Tests:',
        availableTests.length
    );

    setupTestSelector();
}


/* =========================================================
   TEST SELECTOR
   ========================================================= */

function setupTestSelector() {

    let selector =
        document.getElementById(
            'testSelect'
        );

    if (!selector) {

        const setup =
            document.getElementById(
                'testSetup'
            );

        if (!setup) {
            return;
        }

        selector =
            document.createElement(
                'select'
            );

        selector.id =
            'testSelect';

        selector.className =
            'test-select';

        setup.insertBefore(
            selector,
            setup.firstChild
        );
    }

    selector.innerHTML = '';

    if (
        availableTests.length === 0
    ) {

        const option =
            document.createElement(
                'option'
            );

        option.value = '';

        option.textContent =
            'कोई Test उपलब्ध नहीं है';

        selector.appendChild(
            option
        );

        return;
    }

    /*
       Group by Exam / Category / Subject
       लेकिन selector compatibility के लिए
       flat list रखी गई है।
    */

    availableTests.forEach(
        (item, index) => {

            const option =
                document.createElement(
                    'option'
                );

            option.value =
                String(index);

            option.textContent =
                `${item.exam} • ${item.category} • ${item.subject} • ${item.title} • ${item.questions.length} प्रश्न`;

            selector.appendChild(
                option
            );
        }
    );
}


/* =========================================================
   START TEST
   ========================================================= */

async function startTest() {

    clearInterval(timerId);

    test = [];
    current = 0;
    score = 0;
    timeLeft = 0;

    selectedAnswers = [];
    markedQuestions = [];

    if (
        availableTests.length === 0
    ) {

        await loadAvailableTests();
    }

    if (
        availableTests.length === 0
    ) {

        alert(
            'कोई Test उपलब्ध नहीं है।\n\n' +
            'tests/index.json और TXT file जाँचें।'
        );

        return;
    }

    const selector =
        document.getElementById(
            'testSelect'
        );

    let testIndex = 0;

    if (
        selector &&
        selector.value !== ''
    ) {

        testIndex =
            Number(selector.value);
    }

    currentTestInfo =
        availableTests[testIndex];

    if (!currentTestInfo) {

        alert(
            'Test नहीं मिला।'
        );

        return;
    }

    /*
       Requested Question Count
    */

    const countElement =
        document.getElementById(
            'count'
        );

    let requestedCount =
        Number(
            countElement?.value
        );

    if (
        !Number.isFinite(
            requestedCount
        ) ||
        requestedCount <= 0
    ) {

        requestedCount =
            Math.min(
                MAX_QUESTIONS,
                currentTestInfo.questions.length
            );
    }

    requestedCount =
        Math.max(
            1,
            Math.min(
                requestedCount,
                MAX_QUESTIONS
            )
        );

    /*
       Actual available questions
    */

    const availableQuestions =
        currentTestInfo.questions;

    const count =
        Math.min(
            requestedCount,
            availableQuestions.length
        );

    /*
       Random Question Selection
    */

    test =
        shuffle(
            availableQuestions
        ).slice(
            0,
            count
        );

    if (
        test.length === 0
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

    /*
       Test-specific timer
    */

    timeLeft =
        calculateTotalTime(
            test.length,
            getTimePerQuestion()
        );

    const setup =
        document.getElementById(
            'testSetup'
        );

    const result =
        document.getElementById(
            'resultArea'
        );

    const area =
        document.getElementById(
            'testArea'
        );

    if (setup) {
        setup.classList.add('hidden');
    }

    if (result) {
        result.classList.add('hidden');
    }

    if (area) {
        area.classList.remove('hidden');
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

                    finishTest(true);
                }

            },
            1000
        );
}


/* =========================================================
   SHUFFLE
   ========================================================= */

function shuffle(array) {

    const result =
        [...array];

    for (
        let i = result.length - 1;
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
        .padStart(2, '0');

    const seconds =
        (
            timeLeft % 60
        )
        .toString()
        .padStart(2, '0');

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

    /*
       TEST HEADER
    */

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
                        'GS'
                    )}
                </span>

                <span>
                    •
                    ${escapeHtml(
                        currentTestInfo?.subject ||
                        'GS'
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
    `;

    /*
       PROGRESS
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
       QUESTION
    */

    html += `
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

    /*
       OPTIONS
    */

    question.o.forEach(
        (option, index) => {

            const selected =
                selectedAnswers[current] === index
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

    /*
       NAVIGATION
    */

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
                    current === test.length - 1
                        ? '🏁 समाप्त करें'
                        : 'अगला ➡️'
                }

            </button>

        </div>
    `;

    /*
       MARK
    */

    html += `
        <div class="mark-area">

            <button
                type="button"
                onclick="toggleMark()">

                ${
                    markedQuestions[current]
                        ? '⭐ Mark हटाएँ'
                        : '☆ प्रश्न Mark करें'
                }

            </button>

        </div>
    `;

    /*
       PALETTE
    */

    html += `
        <div class="palette-title">
            प्रश्न सूची
        </div>

        <div class="palette">
    `;

    test.forEach(
        (_, index) => {

            let classes = '';

            if (
                index === current
            ) {
                classes +=
                    'current ';
            }

            if (
                selectedAnswers[index] !==
                undefined
            ) {
                classes +=
                    'answered ';
            }

            if (
                markedQuestions[index]
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

    /*
       PALETTE LEGEND
    */

    html += `
        <div class="palette-legend">

            <span>
                🟦 Current
            </span>

            <span>
                🟩 Answered
            </span>

            <span>
                ⬜ Unanswered
            </span>

            <span>
                ⭐ Marked
            </span>

        </div>
    `;

    area.innerHTML =
        html;

    updateTimer();
}


/* =========================================================
   ANSWER
   ========================================================= */

function answer(number) {

    if (
        number < 0 ||
        number > 3
    ) {
        return;
    }

    selectedAnswers[current] =
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

        confirmFinishTest();
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

        confirmFinishTest();
    }
}


/* =========================================================
   GO QUESTION
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
   MARK QUESTION
   ========================================================= */

function toggleMark() {

    if (
        !markedQuestions.length
    ) {
        return;
    }

    markedQuestions[current] =
        !markedQuestions[current];

    renderQuestion();
}


/* =========================================================
   CONFIRM FINISH
   ========================================================= */

function confirmFinishTest() {

    const unanswered =
        selectedAnswers.filter(
            value =>
                value === undefined
        ).length;

    if (
        unanswered > 0
    ) {

        const proceed =
            confirm(
                `अभी ${unanswered} प्रश्न अनुत्तरित हैं।\n\nक्या आप Test समाप्त करना चाहते हैं?`
            );

        if (!proceed) {
            return;
        }
    }

    finishTest(false);
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

    /*
       Prevent duplicate finish
    */

    timerId = null;

    score = 0;

    let attempted = 0;
    let correct = 0;
    let wrong = 0;
    let unanswered = 0;

    const marks =
        getMarksPerQuestion();

    const negative =
        getNegativeMarking();

    selectedAnswers.forEach(
        (answerValue, index) => {

            if (
                answerValue === undefined
            ) {

                unanswered++;

                return;
            }

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
    );

    /*
       Final Score
       Correct × marks
       minus Wrong × negative marking
    */

    score =
        (
            correct * marks
        ) -
        (
            wrong * negative
        );

    /*
       Accuracy
       केवल attempted questions पर
    */

    const accuracy =
        attempted > 0
            ? Math.round(
                (
                    correct /
                    attempted
                ) * 100
              )
            : 0;

    const total =
        test.length;

    const totalPossibleMarks =
        total * marks;

    const totalTime =
        calculateTotalTime(
            total,
            getTimePerQuestion()
        );

    const timeTaken =
        Math.max(
            0,
            totalTime -
            timeLeft
        );

    /*
       Result Area
    */

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

    const student =
        getStudentName();

    const resultData = {

        student:
            student,

        testId:
            currentTestInfo?.id ||
            '',

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

        score:
            score,

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
            marks,

        negativeMarking:
            negative,

        totalPossibleMarks:
            totalPossibleMarks,

        timePerQuestion:
            getTimePerQuestion(),

        totalTime:
            totalTime,

        timeTaken:
            timeTaken,

        timeRemaining:
            timeLeft,

        timeout:
            timeout,

        date:
            new Date()
                .toLocaleString(
                    'hi-IN'
                )
    };

    /*
       RESULT HTML
    */

    result.innerHTML = `

        <div class="result-card">

            <div class="score">
                🏆 Test Complete
            </div>

            <h2>
                ${escapeHtml(student)}
            </h2>

            <h3>
                ${escapeHtml(
                    currentTestInfo?.title ||
                    'GS Test'
                )}
            </h3>

            <p>
                ${escapeHtml(
                    currentTestInfo?.exam ||
                    ''
                )}
                •
                ${escapeHtml(
                    currentTestInfo?.category ||
                    ''
                )}
                •
                ${escapeHtml(
                    currentTestInfo?.subject ||
                    ''
                )}
            </p>

            <div class="result-score">

                ${formatNumber(score)}
                /
                ${formatNumber(
                    totalPossibleMarks
                )}

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
                ⭕ Unanswered:
                <strong>${unanswered}</strong>
            </p>

            <p>
                🎯 Accuracy:
                <strong>${accuracy}%</strong>
            </p>

            <p>
                💯 प्रति प्रश्न अंक:
                <strong>${marks}</strong>
            </p>

            <p>
                ➖ Negative Marking:
                <strong>${negative}</strong>
            </p>

            <p>
                ⏱️ प्रति प्रश्न:
                <strong>
                    ${getTimePerQuestion()} सेकंड
                </strong>
            </p>

            <p>
                ⏰ कुल समय:
                <strong>
                    ${formatDuration(totalTime)}
                </strong>
            </p>

            <p>
                ⌛ लिया गया समय:
                <strong>
                    ${formatDuration(timeTaken)}
                </strong>
            </p>

            <p>
                ⏳ बचा हुआ समय:
                <strong>
                    ${formatDuration(timeLeft)}
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
                onclick="showDetailedReview()">

                📖 Answer Explanation

            </button>

            <button
                type="button"
                onclick="resetTest()">

                🔄 फिर से Test दें

            </button>

            <button
                type="button"
                onclick="show('home')">

                🏠 Home

            </button>

        </div>
    `;

    /*
       Save Last Result
    */

    localStorage.setItem(
        'lastScore',
        JSON.stringify(
            resultData
        )
    );

    /*
       Save Result History
    */

    saveResultHistory(
        resultData
    );

    /*
       Save detailed answers
    */

    saveDetailedResult(
        resultData
    );
}


/* =========================================================
   FORMAT NUMBER
   ========================================================= */

function formatNumber(value) {

    const number =
        Number(value);

    if (
        Number.isInteger(number)
    ) {
        return String(number);
    }

    return number.toFixed(2);
}


/* =========================================================
   SAVE RESULT HISTORY
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
            !Array.isArray(history)
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
        JSON.stringify(history)
    );
}


/* =========================================================
   SAVE DETAILED RESULT
   ========================================================= */

function saveDetailedResult(
    resultData
) {

    const detailed = {

        ...resultData,

        answers:
            selectedAnswers.map(
                (answer, index) => ({

                    question:
                        test[index]?.q ||
                        '',

                    options:
                        test[index]?.o ||
                        [],

                    studentAnswer:
                        answer !== undefined
                            ? answer
                            : null,

                    correctAnswer:
                        test[index]?.a ??
                        null,

                    marked:
                        markedQuestions[index] ||
                        false

                })
            )
    };

    localStorage.setItem(
        'lastDetailedResult',
        JSON.stringify(
            detailed
        )
    );
}


/* =========================================================
   SHOW DETAILED ANSWER REVIEW
   ========================================================= */

function showDetailedReview() {

    const result =
        document.getElementById(
            'resultArea'
        );

    if (!result) {
        return;
    }

    const saved =
        localStorage.getItem(
            'lastDetailedResult'
        );

    if (!saved) {

        alert(
            'Detailed Result उपलब्ध नहीं है।'
        );

        return;
    }

    let data;

    try {

        data =
            JSON.parse(saved);

    } catch {

        alert(
            'Detailed Result पढ़ने में समस्या हुई।'
        );

        return;
    }

    if (
        !Array.isArray(data.answers)
    ) {
        return;
    }

    let html = `

        <div class="result-card">

            <h2>
                📖 Answer Explanation
            </h2>

            <h3>
                ${escapeHtml(
                    data.test ||
                    'GS Test'
                )}
            </h3>
    `;

    data.answers.forEach(
        (item, index) => {

            const student =
                item.studentAnswer;

            const correct =
                item.correctAnswer;

            const isCorrect =
                student !== null &&
                student === correct;

            html += `

                <div class="review-item">

                    <h3>
                        प्रश्न ${index + 1}
                    </h3>

                    <p>
                        <strong>
                            ${escapeHtml(
                                item.question
                            )}
                        </strong>
                    </p>

            `;

            item.options.forEach(
                (option, optionIndex) => {

                    let marker = '';

                    if (
                        optionIndex === correct
                    ) {
                        marker =
                            ' ✅ सही उत्तर';
                    }

                    if (
                        optionIndex === student &&
                        optionIndex !== correct
                    ) {
                        marker =
                            ' ❌ आपका उत्तर';
                    }

                    html += `

                        <p>

                            ${String.fromCharCode(
                                65 + optionIndex
                            )}.
                            ${escapeHtml(
                                option
                            )}

                            ${marker}

                        </p>
                    `;
                }
            );

            html += `

                    <p>
                        ${
                            student === null
                                ? '⭕ आपने उत्तर नहीं दिया।'
                                : isCorrect
                                    ? '✅ आपका उत्तर सही है।'
                                    : '❌ आपका उत्तर गलत है।'
                        }
                    </p>

                    <hr>

                </div>
            `;
        }
    );

    html += `

            <button
                type="button"
                onclick="showLastResult()">

                ⬅️ Result पर वापस जाएँ

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
   SHOW RESULT HISTORY
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

        if (
            !Array.isArray(history)
        ) {
            history = [];
        }

    } catch {

        history = [];
    }

    if (
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
                        ${formatNumber(
                            item.score
                        )}
                        /
                        ${formatNumber(
                            item.totalPossibleMarks ??
                            item.total
                        )}

                        |

                        Accuracy:
                        ${item.accuracy}%

                    </p>

                    <p>

                        Attempted:
                        ${item.attempted}

                        |

                        Correct:
                        ${item.correct ??
                        item.score}

                        |

                        Wrong:
                        ${item.wrong}

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

    timerId = null;

    test = [];

    current = 0;

    score = 0;

    timeLeft = 0;

    selectedAnswers = [];

    markedQuestions = [];

    currentTestInfo = null;

    const result =
        document.getElementById(
            'resultArea'
        );

    const testArea =
        document.getElementById(
            'testArea'
        );

    const setup =
        document.getElementById(
            'testSetup'
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

    if (setup) {

        setup.classList.remove(
            'hidden'
        );
    }

    setupCountOptions();

    /*
       Reload Test Selector
    */

    setupTestSelector();
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

    /*
       Duplicate listener से बचें
    */

    if (
        fileInput.dataset.initialized ===
        'true'
    ) {
        return;
    }

    fileInput.dataset.initialized =
        'true';

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

                /*
                   Local Custom Test
                */

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

                    questionCount:
                        questions.length,

                    timePerQuestion:
                        TIME_PER_QUESTION,

                    marks:
                        1,

                    negativeMarking:
                        0,

                    published:
                        true

                });

                setupTestSelector();

                const selector =
                    document.getElementById(
                        'testSelect'
                    );

                if (selector) {

                    selector.value =
                        String(
                            availableTests.length - 1
                        );
                }

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

            /*
               Same file दोबारा select करने की अनुमति
            */

            this.value = '';
        }
    );
}


/* =========================================================
   SHOW LAST RESULT
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
            JSON.parse(saved);

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

                ${formatNumber(
                    data.score
                )}
                /
                ${formatNumber(
                    data.totalPossibleMarks ??
                    data.total
                )}

            </div>

            <p>
                🎯 Accuracy:
                ${data.accuracy}%
            </p>

            <p>
                📝 Attempted:
                ${data.attempted}
            </p>

            <p>
                ✅ Correct:
                ${data.correct ??
                data.score}
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

            <button
                type="button"
                onclick="showDetailedReview()">

                📖 Detailed Result

            </button>

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

        /*
           Saved Name
        */

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
           Service Worker
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
