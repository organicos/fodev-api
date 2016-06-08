module.exports = function(grunt) {
    grunt.loadTasks('../node_modules/grunt-ng-annotate/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-uglify/tasks');
    grunt.loadTasks('../node_modules/grunt-sass/tasks');
    grunt.loadTasks('../node_modules/grunt-contrib-cssmin/tasks');
    grunt.registerTask('default',['ngAnnotate', 'uglify', 'sass', 'cssmin']);

    grunt.initConfig({
        ngAnnotate: {
            options: {
                singleQuotes: true,
            },
            jsFiles: {
                files: {
                    'app.concat.js': [
                        'bower_components/angular-i18n/angular-locale_pt-br.js'
                        , 'bower_components/angular-route/angular-route.min.js'
                        , 'bower_components/ngstorage/ngStorage.min.js'
                        , 'bower_components/angular-bootstrap/ui-bootstrap.min.js'
                        , 'bower_components/angular-bootstrap/ui-bootstrap-tpls.js'
                        , 'bower_components/angular-filter/dist/angular-filter.min.js'
                        , 'bower_components/angular-sanitize/angular-sanitize.min.js'
                        , 'bower_components/angular-animate/angular-animate.min.js'
                        , 'bower_components/angularjs-socialshare/src/js/angular-socialshare.js'
                        , 'bower_components/Chart.js/Chart.min.js'
                        , 'bower_components/angular-chart.js/dist/angular-chart.min.js'
                        , 'bower_components/ng-file-upload/ng-file-upload-shim.min.js'
                        , 'bower_components/ng-file-upload/ng-file-upload.min.js'
                        , 'bower_components/angular-image-crop/image-crop.js'
                        , 'partials/*/*.js'
                        , 'filters/*.js'
                        , 'services/*.js'
                        , 'services/*/*.js'
                        , 'controllers/*.js'
                        , 'directives/*/*.js'
                    ]
                },
            }
        },
        uglify: {
            jsFiles: {
                files: {
                    'app.min.js': ['app.concat.js']
                }
            }
        },
        sass: {
            options: {
                sourceMap: true
            },
            dist: {
                files: {
                    './stylesheets/main.css': './stylesheets/main.scss'
                }
            }
        },
        cssmin: {
            options: {
                shorthandCompacting: false,
                roundingPrecision: -1
            },
            target: {
                files: {
                    'app.min.css': [
                        './bower_components/bootstrap-24grid-violet/css/bootstrap.min.css'
                        , './bower_components/angular-chart.js/dist/angular-chart.css'
                        , './stylesheets/main.css'
                    ]
                }
            }
        }
    });
    
};


