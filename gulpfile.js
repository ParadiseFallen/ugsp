//#region imports
//* https://webdesign-master.ru/blog/docs/gulp-documentation.html
//* filemap for project
import fileMap from './filemap.js'
import serverInit from './serverInit.js'
//* base gulp
import gulp from 'gulp'
//* autoupdate browser
import browserSync from 'browser-sync'
// * Do cache pipe method
import cache from 'gulp-cache'
// * pipeIf(cunduction,do) or pipeIf(cunduction,do,else)
import pipeIf from 'gulp-if'
// * Support for @@include and loops. simple html preprocessor
// ? https://www.npmjs.com/package/gulp-file-include
import fileInclude from 'gulp-file-include'
import sourcemaps from 'gulp-sourcemaps'
import minifyHtml from 'gulp-htmlmin'
import sass from 'gulp-sass'
import autoPrefixer from 'gulp-autoprefixer'
import mediaGroup from 'crlab-gulp-combine-media-queries'

import cleanCss from 'gulp-clean-css'
import stripComments from 'gulp-strip-comments'
import clean from 'gulp-clean'
import image from 'gulp-image'
import rename from 'gulp-rename'
import gulpIf from 'gulp-if'
import buildContext from './buildContext.js'
//* src => стартовая локация. src('./styles') далее использовать .pipe(plugin())
//* dest => цель. dest('./styles') использовать в самом конце
//* task => объявить задачу task(taskName,function)
//* series => запустить череду задач в сьрогом порядке
//* parallel => запустить задачи в параллельном режиме 
//* watch => следить за изменением watch(glob,function) 
//* так же можно использовать watch().on()
const { src, dest, task, parallel, series, watch } = gulp


const lastArgument = process.argv[process.argv.length - 1];
const isReleaseBuild = lastArgument == '-r' || lastArgument == '-release'
console.log(`\tIs release build : ${isReleaseBuild}. To enable add -r or -release \n\tas last flag`)

//#endregion

//#region  TASKS

// * Show filemap that will use gulp
task('filemap', async () => {
    console.log(fileMap)
})

//#region BUILD

// * Build development 
task('build-pages', () => src(`${fileMap.src.pages}/**/!(_*).html`)
    .pipe(fileInclude({
        prefix: '@@',
        basepath: '@file',
        indent: true,
        context: {
            context: buildContext
        }
    }))
    .pipe(stripComments())
    .pipe(gulpIf(isReleaseBuild, minifyHtml()))
    .pipe(dest(`${fileMap.build.pages}/`))
    .pipe(browserSync.stream())
)

task('build-styles', () =>
    src(`${fileMap.src.styles}/!(_*).+(scss|sass)`)
        .pipe(gulpIf(!isReleaseBuild, sourcemaps.init()))
        .pipe(sass().on('error', sass.logError))
        .pipe(mediaGroup())
        .pipe(autoPrefixer({
            "cascade": true,
            "overrideBrowserslist": ["last 5 versions"]
        }))
        .pipe(pipeIf(isReleaseBuild,
            cleanCss(
                {

                }
            ),
            cleanCss({
                "format": "beautify",
                level: 2
            })))
        .pipe(gulpIf(!isReleaseBuild, sourcemaps.write()))
        .pipe(dest(fileMap.build.styles))
        .pipe(browserSync.stream())
)

task('build-scripts', () =>
    src(`${fileMap.src.scripts}/!(_*).+(js|ts)`)
        .pipe(stripComments())
        .pipe(dest(fileMap.build.scripts))
        .pipe(browserSync.stream())
)

task('build-img', () =>
    src(`${fileMap.src.img}/**/*.+(png|jpg|gif|ico|svg|webp)`)
        .pipe(cache(image()))
        .pipe(dest(fileMap.build.img))
        .pipe(browserSync.stream())

)

task('build-fonts', () =>
    src(`${fileMap.src.fonts}/**/*`)
        .pipe(dest(fileMap.build.fonts))
        .pipe(browserSync.stream())
)

task('build-resources', () => src(fileMap.src.resources, { allowEmpty: true }).pipe(dest(fileMap.build.resources)))

task('default', parallel('build-resources', 'build-styles', 'build-pages', 'build-scripts', 'build-img', 'build-fonts'))

task('build', series('default'))
//#endregion

//#region Watch

// * Watch only styles .sccs .sass files
task('watch-styles', () =>
    watch(`${fileMap.src.styles}/**/*.+(scss|sass)`, series('build-styles')))

// * Watch only pages .pug .html files
task('watch-pages', () =>
    watch(`${fileMap.src.pages}/**/*.+(html|pug)`, series('build-pages')))
// * Watch only pages .pug .html files
task('watch-scripts', () =>
    watch(`${fileMap.src.scripts}/**/*.+(js|ts)`, series('build-scripts')))
// * Watch only pages .pug .html files
task('watch-img', () =>
    watch(`${fileMap.src.img}/**/*.+(png|jpg|gif|ico|svg|webp)`, series('build-img')))

// * Watch only pages .pug .html files
task('watch-fonts', () =>
    watch(`${fileMap.src.fonts}/**/*`, series('build-fonts')))

task('live-server', serverInit)

// * Watch full project
task('watch', series('default', parallel('live-server', 'watch-styles', 'watch-pages', 'watch-scripts', 'watch-img')))

//#endregion

//#region Clean

task('clean-pages', () =>
    src(`${fileMap.build.pages}/**/*`)
        .pipe(clean()))

task('clean-styles', () =>
    src(`${fileMap.build.styles}/**/*`)
        .pipe(clean()))

task('clean-scripts', () =>
    src(`${fileMap.build.scripts}/**/*`)
        .pipe(clean()))

task('clean-fonts', () =>
    src(`${fileMap.build.fonts}/**/*`)
        .pipe(clean()))

task('clean-img', () =>
    src(`${fileMap.build.img}/**/*`)
        .pipe(clean()))

task('clean-all', () =>
    src(`${fileMap.build.folder}/*`)
        .pipe(clean()))

//#endregion

task('rebuild-all', series('clean-all', 'default'))


//#endregion