'use strict';

const debug = require('debug')('wechat');
const crypto = require('crypto');
const request = require('request-promise');
const Promise = require('bluebird');
const config = require('./config');

const defaultOptions = {
  json: true,
  strictSSL: false,
  simple: true,
  resolveWithFullResponse: false,
};

//1h 59m, token is only valid within 2 hours
const REFRESH_INTERVAL = 1000 * 119 * 60;

const util = {};

/**
 * Generate digest hash based on the content
 * @param {*} content content to be digested
 * @param {string=} algorithm digest algorithm, default 'sha1'
 * @return {string}
 */
util.genHash = (content, algorithm) => {
  const c = crypto.createHash(algorithm);
  c.update(content);
  return c.digest('hex');
};

/**
 * Generate sha1 content
 * @param {*} content
 * @return {string}
 */
util.genSHA1 = content => util.genHash(content, 'sha1');

/**
 * Parse the object to query string without encoding based on the ascii key order
 * @param {object} args
 * @return {string}
 */
util.paramsToString = (args) => {
  let originalKeys = Object.keys(args);
  const keys = originalKeys.map(k => k.toLowerCase());
  keys.sort();
  const queryParts = [];
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    queryParts.push(`${key}=${args[key]}`);
  }
  return queryParts.join('&');
};

/**
 * Send the request to wechat server
 * @param {object} options custom request options
 * @return {Promise}
 */
util.sendWechatRequest = (options) => {
  const myOptions = Object.assign({}, defaultOptions, options);
  return request(myOptions)
    .then((body) => {
      if(body.hasOwnProperty('errcode') && body.errcode !== 0) {
        return Promise.reject(body);
      }
      return Promise.resolve(body);
    })
    .catch((err) => {
      debug(err);
      return Promise.reject(err);
    });
};

/**
 * Create nonce string
 * @return {string}
 */
util.nonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

/**
 * Create timestamp string
 * @return {string}
 */
util.timestamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
};

/**
 * Check if token is expired
 * @param modifyDate
 * @return {boolean}
 */
util.isExpired = function (modifyDate) {
  return Date.now() - new Date(modifyDate).getTime() > REFRESH_INTERVAL;
};

module.exports = util;