/* =========================================================
   GS JUNCTION PRAYAGRAJ
   ONLINE TEST SYSTEM - SCALABLE VERSION
   =========================================================
   Features:
   • tests/index.json से Tests Auto Load
   • Published / Draft support
   • Exam / Category / Subject support
   • Test-specific timePerQuestion
   • Test-specific marks
   • Negative marking
   • 150 Questions तक
   • Previous / Next / Skip
   • Question Palette
   • Mark Question
   • Score / Accuracy / Result
   • Student Name
   • LocalStorage Result History
   • TXT Question Parser
   • File Upload
   • PWA Service Worker
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

let testStartedAt = null;
let testTimeLimit = 0;


/* =========================================================
   SETTINGS
   ========================================================= */

const DEFAULT_TIME_PER_QUESTION = 45;
const DEFAULT_MARKS = 1;
const DEFAULT_NEGATIVE_MARKING = 0;

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

    const input =
        document.getElementById('name');

    const msg =
        document.getElementById('msg');

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
            'प्रोफाइल सुरक्षित: ' + name;
    }
}


/* =========================================================
   GET STUDENT NAME
   ========================================================= */

function getStudentName() {

    const input =
        document.getElementById('name');

    if (input && input.value.trim()) {
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

        option.value = number;

        option.textContent =
            number + ' प्रश्न';

        countSelect.appendChild(option);
    });

    countSelect.value = '150';
}


/* =========================================================
   GET CURRENT TIME PER QUESTION
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


/* =========================================================
   GET MARKS
   ========================================================= */

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


/* =========================================================
   GET NEGATIVE MARKING
   ========================================================= */

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


/* =========================================================
   TOTAL TIME
   ========================================================= */

function calculateTotalTime(count) {

    return (
        Number(count) *
        getTimePerQuestion()
    );
}


/* =========================================================
   FORMAT TIME
   ========================================================= */

function formatDuration(seconds) {

    seconds =
        Math.max(
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
        .replace(/\n{3,}/g, '\n\n')
        .trim();
}


/* =========================================================
   PARSE ANSWER
   ========================================================= */

function parseAnswer(text) {

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
            .charCodeAt(0) - 65
    );
}


/* =========================================================
   PARSE TXT QUESTIONS
   ========================================================= */

function parseQuestions(text) {

    if (!text) {
        return [];
    }

    text =
        String(text)
            .replace(/\r/g, '');

    /*
       Markdown headings हटाएँ
    */

    text =
        text.replace(
            /^#{1,6}\s+.*$/gm,
            ''
        );

    /*
       Question formats:

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

        let block =
            text
                .slice(start, end)
                .trim();

        if (!block) {
            continue;
        }

        /*
           Answer detection
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
                .charCodeAt(0) - 65;

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
            (optionMatch =
                optionRegex.exec(questionPart))
            !== null
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
                (optionMatch =
                    inlineRegex.exec(questionPart))
                !== null
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

            if (optionText) {
                options.push(optionText);
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
                options.slice(0, 4),

            a:
                answer

        });
    }

    return questions;
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
           Array format support
        */

        if (Array.isArray(data)) {
            return data;
        }

        /*
           Object format support
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
   AUTO LOAD TESTS
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

        let file = '';
        let exam = 'GS';
        let category = 'GS';
        let subject = 'GS';
        let title = '';

        let id = '';
        let questionsCount = 0;
        let timePerQuestion =
            DEFAULT_TIME_PER_QUESTION;
        let marks =
            DEFAULT_MARKS;
        let negativeMarking =
            DEFAULT_NEGATIVE_MARKING;
        let published = true;

        /*
           String format
        */

        if (
            typeof item === 'string'
        ) {

            file = item;

        }

        /*
           Object format
        */

        else if (
            item &&
            typeof item === 'object'
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
                'GS';

            category =
                item.category ||
                'GS';

            subject =
                item.subject ||
                'GS';

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
                !Number.isFinite(marks)
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

            /*
               published false = hidden
            */

            published =
                item.published !== false;
        }

        /*
           Invalid file
        */

        if (!file) {
            continue;
        }

        /*
           Draft / unpublished test को load नहीं करेंगे
        */

        if (!published) {

            console.log(
                'Unpublished Test skipped:',
                title || file
            );

            continue;
        }

        const questions =
            await loadTestFile(file);

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
            'कोई Published Test उपलब्ध नहीं है';

        selector.appendChild(
            option
        );

        return;
    }

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

    testStartedAt =
        Date.now();

    if (
        availableTests.length === 0
    ) {

        await loadAvailableTests();
    }

    if (
        availableTests.length === 0
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

    let testIndex = 0;

    if (
        selector &&
        selector.value !== ''
    ) {

        testIndex =
            Number(
                selector.value
            );
    }

    currentTestInfo =
        availableTests[testIndex];

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

    testTimeLimit =
        calculateTotalTime(
            test.length
        );

    timeLeft =
        testTimeLimit;

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

    /*
       Last 10 seconds
    */

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
                        ''
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
       TEST INFORMATION
    */

    html += `
        <div class="test-info">

            <strong>
                ${escapeHtml(
                    currentTestInfo?.title ||
                    'GS Test'
                )}
            </strong>

            <span>
                प्रति प्रश्न:
                ${getTimePerQuestion()} सेकंड
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
    `;


    /*
       PROGRESS
    */

    html += `
        <div class="progress">
            प्रश्न ${current + 1} / ${test.length}
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
       MARK BUTTON
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
       QUESTION PALETTE
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
                classes += 'current ';
            }

            if (
                selectedAnswers[index] !==
                undefined
            ) {
                classes += 'answered ';
            }

            if (
                markedQuestions[index]
            ) {
                classes += 'marked ';
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

    markedQuestions[current] =
        !markedQuestions[current];

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

    /*
       Calculate result
    */

    let correct = 0;
    let wrong = 0;
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


    /*
       Score calculation
    */

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


    /*
       Maximum marks
    */

    const maximumMarks =
        total *
        marksPerQuestion;


    /*
       Accuracy
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


    /*
       Time
    */

    const timeTaken =
        Math.max(
            0,
            testTimeLimit -
            timeLeft
        );


    /*
       Hide Test
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


    /*
       Result Area
    */

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


    /*
       Result Data
    */

    const resultData = {

        student:
            student,

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
            '',

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


    /*
       Result HTML
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


            <div class="result-score">

                ${score}
                /
                ${maximumMarks}

            </div>


            <p>

                📚 कुल प्रश्न:

                <strong>
                    ${total}
                </strong>

            </p>


            <p>

                📝 Attempted:

                <strong>
                    ${attempted}
                </strong>

            </p>


            <p>

                ✅ सही:

                <strong>
                    ${correct}
                </strong>

            </p>


            <p>

                ❌ गलत:

                <strong>
                    ${wrong}
                </strong>

            </p>


            <p>

                ⭕ अनुत्तरित:

                <strong>
                    ${unanswered}
                </strong>

            </p>


            <p>

                🎯 Accuracy:

                <strong>
                    ${accuracy}%
                </strong>

            </p>


            <p>

                ➕ प्रति सही उत्तर:

                <strong>
                    ${marksPerQuestion}
                </strong>

            </p>


            <p>

                ➖ Negative Marking:

                <strong>
                    ${negative}
                </strong>

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
                    ${formatDuration(
                        testTimeLimit
                    )}
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
        (question, index) => {

            const studentAnswer =
                selectedAnswers[index];

            const correctAnswer =
                question.a;


            let status =
                '';

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

                                    ? escapeHtml(
                                        String.fromCharCode(
                                            65 +
                                            studentAnswer
                                        )
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
                            (option, optionIndex) => `

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
                onclick="show('home')">

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

function saveResultHistory(resultData) {

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
                        'GS',

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
