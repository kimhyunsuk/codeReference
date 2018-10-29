module.exports = {
  zemba: function (req) {
    
    var origin = '01-Jan-2017 - 31-Dec-2017 2019';

    //var origin = '2017';
    var pattern = /2\d\d\d/ig;


    if(pattern.test(origin)) {
      console.log(pattern.exec(origin));
      var arr = origin.match(pattern);
      var intArr = Math.min.apply(null, arr.map(Number));

      origin = 'dfadsf 1.5000000%';

      pattern = /[^0-9\.]+/g;
      var resultint = Number(origin.replace(pattern,""));

      console.log(resultint);
    } else {
      console.log('no');
    }

    return req
  }
};