/*global $, R */

class Http {
  constructor(url) {
    this.url = url;
  }

  get(url, args) {
    return new Promise((resolve, reject) => {
      $.get(this.url + url + this.getUrlParams(args))
        .fail(function (r) {
          reject(r);
        })
        .done(function (r) {
          resolve(r);
        })
      ;
    });
  }

  getUrlParams(args) {
    let filtersToApply = R.toPairs(args),
        appliedFilters = R.map(R.join('='), filtersToApply),
        concatenatedFilters = R.join('&', appliedFilters),
        concatIfNotEmpty = R.ifElse(R.isEmpty, R.always(''), R.concat('?'));

    return concatIfNotEmpty(concatenatedFilters);
  }
}
