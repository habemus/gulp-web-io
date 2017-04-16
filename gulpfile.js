// native
const path = require('path');
const fs   = require('fs');

// third-party
const gulp     = require('gulp');
const faker    = require('faker');
const rimraf   = require('rimraf');
const DataItem = require('habemus-data').Item;

// own
const gulpWebIO = require('./index');

function genArray(size) {

  var arr = [];

  while (size > 0) {
    arr.push(null);

    size -= 1;
  }

  return arr;
}

function shuffle(a) {
    for (let i = a.length; i; i--) {
        let j = Math.floor(Math.random() * i);
        [a[i - 1], a[j]] = [a[j], a[i - 1]];
    }
}


const COLORS = [
  'red',
  'blue',
  'green',
  'magenta',
  'cyan',
  'darkred',
  'navy',
  'gold',
  'salmon',
  'skyblue',
  'steelblue',
  'plum',
  'forestgreen',
  'goldenrod',
  'gray',
];

function randomColors() {

  var colors = COLORS.concat([]);
  shuffle(colors);
  var inverseQtty = Math.floor(Math.random() * COLORS.length);

  // inverseQtty = 6;
  inverseQtty = Math.max(12, inverseQtty);

  while (inverseQtty > 0) {
    colors.splice(COLORS[Math.floor(Math.random() * COLORS.length)], 1);
    inverseQtty -= 1;
  }

  return colors;
}

gulp.task('dataset', () => {

  var setSize = 5000;

  var arr = genArray(setSize);

  var dataSetPath = path.join(__dirname, 'test/fixtures/benchmark/posts');

  rimraf.sync(dataSetPath);

  fs.mkdirSync(dataSetPath);


  return arr.reduce((lastPromise) => {

    return lastPromise.then(() => {
      var title = faker.lorem.words();
      var id = faker.helpers.slugify(title);

      var item = new DataItem(path.join(dataSetPath, id + '.md'));

      item._load({
        data: {
          'template@': '/templates/post.html',
          title: title,
          categories: randomColors(),
          date: faker.date.past(),
          content: faker.lorem.paragraphs(30)
        }
      })
      .then(() => {
        return item._save();
      });
    })


  }, Promise.resolve());
});

gulp.task('web-io', function () {

  rimraf.sync(path.join(__dirname, '.tmp'));

  var src = [
    path.join(__dirname, 'test/fixtures/benchmark/**/*')
  ];

  return gulp.src(src)
    .pipe(gulpWebIO({
      fsRoot: path.join(__dirname, 'test/fixtures/benchmark/')
    }))
    .pipe(gulp.dest('.tmp'));

});
