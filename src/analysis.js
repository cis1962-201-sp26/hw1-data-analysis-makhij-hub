/**
 * [TODO] Step 0: Import the dependencies, fs and papaparse
 */

const fs = require('fs');
const Papa = require('papaparse');

/**
 * [TODO] Step 1: Parse the Data
 *      Parse the data contained in a given file into a JavaScript objectusing the modules fs and papaparse.
 *      According to Kaggle, there should be 2514 reviews.
 * @param {string} filename - path to the csv file to be parsed
 * @returns {Object} - The parsed csv file of app reviews from papaparse.
 */
function parseData(filename) {
    const data = fs.readFileSync(filename, 'utf8');
    const csv = Papa.parse(data, { header: true, skipEmptyLines: true });
    return csv;
}

/**
 * [TODO] Step 2: Clean the Data
 *      Filter out every data record with null column values, ignore null gender values.
 *
 *      Merge all the user statistics, including user_id, user_age, user_country, and user_gender,
 *          into an object that holds them called "user", while removing the original properties.
 *
 *      Convert review_id, user_id, num_helpful_votes, and user_age to Integer
 *
 *      Convert rating to Float
 *
 *      Convert review_date to Date
 * @param {Object} csv - a parsed csv file of app reviews
 * @returns {Object} - a cleaned csv file with proper data types and removed null values
 */
function cleanData(csv) {
    const cleanedData = [];
    for (const row of csv.data) {
        let needsRemoval = false;
        for (const key in row) {
            //check for null/nonxsitant values
            if (
                row[key] === null ||
                row[key] === '' ||
                row[key] === undefined ||
                row[key] === ' '
            ) {
                if (key === 'user_gender') {
                    continue;
                }
                needsRemoval = true;
            }
        }
        //if has null values, skip (don't add to cleaned data)
        if (needsRemoval) continue;

        const user_id = parseInt(row['user_id'], 10);
        const user_age = parseInt(row['user_age'], 10);
        const user_country = row['user_country'];
        const user_gender =
            row['user_gender'] === null ? null : row['user_gender'];

        row['user'] = {
            user_age: user_age,
            user_country: user_country,
            user_gender: user_gender,
            user_id: user_id,
        };

        const cleanedRow = { ...row };

        //convert data types
        cleanedRow['review_id'] = parseInt(row['review_id'], 10);
        cleanedRow['num_helpful_votes'] = parseInt(
            row['num_helpful_votes'],
            10,
        );
        cleanedRow['rating'] = parseFloat(row['rating']);
        cleanedRow['review_date'] = new Date(row['review_date']);
        cleanedRow['verified_purchase'] =
            row['verified_purchase'].toLowerCase() === 'true';

        //combine and delete original user fields

        cleanedRow['user'] = {
            user_age: user_age,
            user_country: user_country,
            user_gender: user_gender,
            user_id: user_id,
        };

        delete cleanedRow['user_id'];
        delete cleanedRow['user_age'];
        delete cleanedRow['user_country'];
        delete cleanedRow['user_gender'];

        cleanedData.push(cleanedRow);
    }
    return cleanedData;
}

/**
 * [TODO] Step 3: Sentiment Analysis
 *      Write a function, labelSentiment, that takes in a rating as an argument
 *      and outputs 'positive' if rating is greater than 4, 'negative' is rating is below 2,
 *      and 'neutral' if it is between 2 and 4.
 * @param {Object} review - Review object
 * @param {number} review.rating - the numerical rating to evaluate
 * @returns {string} - 'positive' if rating is greater than 4, negative is rating is below 2,
 *                      and neutral if it is between 2 and 4.
 */
function labelSentiment({ rating }) {
    if (rating > 4) {
        return 'positive';
    } else if (rating < 2) {
        return 'negative';
    } else {
        return 'neutral';
    }
}

/**
 * [TODO] Step 3: Sentiment Analysis by App
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each app into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{app_name: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for an app
 */
function sentimentAnalysisApp(cleaned) {
    const appSentiments = {};

    for (const review of cleaned) {
        const appName = review.app_name;
        const sentiment = labelSentiment(review);

        if (!appSentiments[appName]) {
            appSentiments[appName] = {
                app_name: appName,
                positive: 0,
                neutral: 0,
                negative: 0,
            };
        }

        appSentiments[appName][sentiment]++;
    }

    //convert to array
    return Object.values(appSentiments);
}

/**
 * [TODO] Step 3: Sentiment Analysis by Language
 *      Using the previous labelSentiment, label the sentiments of the cleaned data
 *      in a new property called "sentiment".
 *      Add objects containing the sentiments for each language into an array.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{review_language: string, positive: number, neutral: number, negative: number}[]} - An array of objects, each summarizing sentiment counts for a language
 */
function sentimentAnalysisLang(cleaned) {
    const languageSentiments = {};

    for (const review of cleaned) {
        const language = review.review_language;
        const sentiment = labelSentiment(review);

        if (!languageSentiments[language]) {
            languageSentiments[language] = {
                review_language: language,
                positive: 0,
                neutral: 0,
                negative: 0,
            };
        }

        languageSentiments[language][sentiment]++;
    }

    //convert to array
    return Object.values(languageSentiments);
}

/**
 * [TODO] Step 4: Statistical Analysis
 *      Answer the following questions:
 *
 *      What is the most reviewed app in this dataset, and how many reviews does it have?
 *
 *      For the most reviewed app, what is the most commonly used device?
 *
 *      For the most reviewed app, what the average star rating (out of 5.0)?
 *
 *      Add the answers to a returned object, with the format specified below.
 * @param {Object} cleaned - the cleaned csv data
 * @returns {{mostReviewedApp: string, mostReviews: number, mostUsedDevice: String, mostDevices: number, avgRating: float}} -
 *          the object containing the answers to the desired summary statistics, in this specific format.
 */
function summaryStatistics(cleaned) {
    const reviewsByApp = sentimentAnalysisApp(cleaned);
    let mostReviewedApp = null;
    let mostReviews = 0;

    for (const app of reviewsByApp) {
        const totalReviews = app.positive + app.neutral + app.negative;
        if (totalReviews > mostReviews) {
            mostReviews = totalReviews;
            mostReviewedApp = app.app_name;
        }
    }

    // for most reviewed app, find the most commonly used device and average rating
    const deviceCounts = {};
    let totalRating = 0;
    let reviewCount = 0;

    for (const review of cleaned) {
        if (review.app_name === mostReviewedApp) {
            const device = review.device_type; 
            deviceCounts[device] = (deviceCounts[device] || 0) + 1;
            totalRating += review.rating;
            reviewCount++;
        }
    }

    const averageRating = totalRating / reviewCount;

    let mostUsedDevice = null;
    let mostDevices = 0;
    for (const device in deviceCounts) {
        if (deviceCounts[device] > mostDevices) {
            mostDevices = deviceCounts[device];
            mostUsedDevice = device;
        }
    }

    return {
        mostReviewedApp: mostReviewedApp,
        mostReviews: mostReviews,
        mostUsedDevice: mostUsedDevice,
        mostDevices: mostDevices,
        avgRating: averageRating,
    };
}

/**
 * Do NOT modify this section!
 */
module.exports = {
    parseData,
    cleanData,
    sentimentAnalysisApp,
    sentimentAnalysisLang,
    summaryStatistics,
    labelSentiment,
};
