/*global $, R */

class Http {
  constructor(url) {
    this.url = url;
  }

  get(url, args) {
    return new Promise((resolve, reject) => {
      $.get(this.url + url + this.getUrlParams(args))
        .fail(function (jqXHR) {
          reject(jqXHR);
        })
        .done(function (data, textStatus, jqXHR) {
          resolve(data);
        })
      ;
    });
  }

  post(url, data) {
    return new Promise((resolve, reject) => {
      $.post(this.url + url, data)
        .fail(function (jqHXR) {
          reject(jqHXR);
        })
        .done(function (data, textStatus, jqHXR) {
          resolve(data);
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
