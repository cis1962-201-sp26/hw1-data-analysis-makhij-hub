/**
 * You may use this file to test your code from analysis.js.
 * Do NOT modify this file whatsoever.
 * Make sure all your code passes the tests, as all these tests will be run for grading!
 */

const assert = require('assert');
const { 
    parseData,
    cleanData,
    sentimentAnalysisApp,
    sentimentAnalysisLang,
    summaryStatistics,
    labelSentiment
 } = require('../src/analysis');

const DATA_FILE = "./src/multilingual_mobile_app_reviews_2025.csv"

describe('Parsing Data', () => {
    it('csv should contain 2514 reviews after parsing', () => {
        const csv = parseData(DATA_FILE)
        assert.strictEqual(2514, csv.data.length)
    });
});

describe('Cleaning Data', () => {
    let csv, cleaned, sample;

    before(() => {
        csv = parseData(DATA_FILE);
        cleaned = cleanData(csv);
        sample = cleaned[404]
    });

    it('all non-gender null column values should be removed, resulting in 2348 reviews left.', () => {
        assert.strictEqual(2348, cleaned.length)
    });
    
    it('should merge user_id, user_age, user_country, and user_gender into a "user" object and remove original properties. Tests against a sample review in the dataset.', () => {
        assert.deepStrictEqual(sample.user, {
            user_age: 69,
            user_country: 'Vietnam',
            user_gender: 'Male',
            user_id: 6363036
        });
        assert.strictEqual(sample.user_id, undefined);
        assert.strictEqual(sample.user_age, undefined);
        assert.strictEqual(sample.user_country, undefined);
        assert.strictEqual(sample.user_gender, undefined);
    });

    it('should convert IDs and numeric fields to correct types, and review_date to Date. Tests against a sample review in the dataset.', () => {
        assert.strictEqual(typeof sample.review_id, 'number');
        assert.strictEqual(typeof sample.num_helpful_votes, 'number');
        assert.strictEqual(typeof sample.user.user_id, 'number');
        assert.strictEqual(typeof sample.user.user_age, 'number');

        assert.strictEqual(typeof sample.rating, 'number');

        assert.ok(sample.review_date instanceof Date);

        assert.strictEqual(typeof sample.verified_purchase, 'boolean');
    });
});

describe('Sentiment Analysis', () => {
    let csv, cleaned;

    before(() => {
        csv = parseData(DATA_FILE);
        cleaned = cleanData(csv);
    });

    it('labelSentiment should correctly label input positive, neutral, and negative ratings, and destructure sample review objects properly when passed as an argument.', () => {
        const sample1 = { rating: 4.1 }
        const sample2 = { rating: 3.0 }
        const sample3 = { rating: 1.9 }
        assert.strictEqual(labelSentiment(sample1), 'positive');
        assert.strictEqual(labelSentiment(sample2), 'neutral');
        assert.strictEqual(labelSentiment(sample3), 'negative');
    });

    it('correctly structures the objects within the array returned from sentimentAnalysisApp, and returns the right number of negative, neutral, and positive reviews. Tests for the sample app Duolingo.', () => {
        const duolingo = sentimentAnalysisApp(cleaned).find((app) => app.app_name === 'Duolingo');
        assert.strictEqual(duolingo.positive, 8);
        assert.strictEqual(duolingo.neutral, 36);
        assert.strictEqual(duolingo.negative, 10);
    });

    it('correctly structures the objects within the array returned from sentimentAnalysisLang, and returns the right number of negative, neutral, and positive reviews. Tests for the sample language es.', () => {
        const es = sentimentAnalysisLang(cleaned).find((lang) => lang.lang_name === 'es');
        assert.strictEqual(es.positive, 30);
        assert.strictEqual(es.neutral, 52);
        assert.strictEqual(es.negative, 22);
    });
});

describe('Statistical Analysis', () => {
    let csv, cleaned;

    before(() => {
        csv = parseData(DATA_FILE);
        cleaned = cleanData(csv);
        summary = summaryStatistics(cleaned);
    });

    it('correctly answers the summary statistic questions, and returned this info in an object with the proper format from the function summaryStatistics', () => {
        assert.strictEqual(summary.mostReviewedApp, 'Pinterest');
        assert.strictEqual(summary.mostReviews, 75);
        assert.strictEqual(summary.mostUsedDevice, 'iPad');
        assert.strictEqual(summary.mostDevices, 19);
        assert.strictEqual(summary.avgRating, 3.012);
    });
});
