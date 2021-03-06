// @flow

jest.setTimeout(60000);

import path from 'path';
import fs from 'fs';
import fsExtra from 'fs-extra';
import {dummyLoggerFactory} from '@mashroom/mashroom-utils/lib/logging_utils';
import MashroomPluginPackageBuilder from '../../../src/plugins/building/MashroomPluginPackageBuilder';

const getTmpFolder = () => {
    const tmpFolder = path.resolve(__dirname, '../../../test-data/building1/tmp');
    fsExtra.emptyDirSync(tmpFolder);
    return tmpFolder;
};

const getPluginPackageFolder = () => {
    const packageFolder = path.resolve(__dirname, '../../../test-data/building1/test-package2');
    fsExtra.emptyDirSync(packageFolder);
    fsExtra.writeJsonSync(path.resolve(packageFolder, 'package.json'), {
        name: 'test2',
        version: '1.0.0',
        dependencies: {
            copyfiles: '^1',
        },
        scripts: {
            build: 'copyfiles package.json package-copy.json',
        },
    });
    return packageFolder;
};

const getErroneousPluginPackageFolder = () => {
    const packageFolder = path.resolve(__dirname, '../../../test-data/building1/test-package3');
    fsExtra.emptyDirSync(packageFolder);
    fsExtra.writeJsonSync(path.resolve(packageFolder, 'package.json'), {
        name: 'test3',
        version: '1.0.0',
        dependencies: {
        },
        scripts: {
            build: 'copyfiles package.json package-copy.json',
        },
    });
    return packageFolder;
};

describe('MashroomPluginPackageBuilderClusterSingleton', () => {

    it('builds a module for the first time correctly and write a build info', (done) => {
        const pluginPackagePath = getPluginPackageFolder();
        const builder = new MashroomPluginPackageBuilder(({name: '', tmpFolder: getTmpFolder()}: any), dummyLoggerFactory);

        builder.on('build-finished', (event) => {
            expect(event.success).toBeTruthy();
            const buildInfoFile = path.resolve(__dirname, '../../../test-data/building1/tmp/build-data/test2.build.json');
            expect(fs.existsSync(buildInfoFile)).toBeTruthy();
            const buildInfo = fsExtra.readJsonSync(buildInfoFile);
            expect(buildInfo.buildStatus).toBe('success');
            expect(buildInfo.buildStart).toBeTruthy();
            expect(buildInfo.buildEnd).toBeTruthy();
            expect(builder._buildQueue.length).toBe(0);
            builder.stopProcessing();
            done();
        });

        builder.addToBuildQueue('test2', pluginPackagePath, 'build');
    });

    it('emits an error when a build error occurs', (done) => {
        const pluginPackagePath = getErroneousPluginPackageFolder();
        const builder = new MashroomPluginPackageBuilder(({name: '', tmpFolder: getTmpFolder()}: any), dummyLoggerFactory);

        builder.on('build-finished', (event) => {
            expect(event.success).toBeFalsy();
            const buildInfoFile = path.resolve(__dirname, '../../../test-data/building1/tmp/build-data/test3.build.json');
            expect(fs.existsSync(buildInfoFile)).toBeTruthy();
            const buildInfo = fsExtra.readJsonSync(buildInfoFile);
            expect(buildInfo.buildStatus).toBe('error');
            expect(builder._buildQueue.length).toBe(0);
            builder.stopProcessing();
            done();
        });

        builder.addToBuildQueue('test3', pluginPackagePath, 'build');
    });

    it('doesnt build if the buildStatus is already running', (done) => {
        const pluginPackagePath = getPluginPackageFolder();
        const builder = new MashroomPluginPackageBuilder(({name: '', tmpFolder: getTmpFolder()}: any), dummyLoggerFactory);

        const buildInfoFile = path.resolve(__dirname, '../../../test-data/building1/tmp/build-data/test2.build.json');
        fsExtra.writeJsonSync(buildInfoFile, {
            buildStatus: 'running',
        });

        builder.on('build-finished', (event) => {
            throw new Error('build-finished must not be fired');
        });

        builder.addToBuildQueue('test2', pluginPackagePath, 'build');

        setTimeout(() => {
            builder.removeFromBuildQueue('test2');
            expect(builder._buildQueue.length).toBe(0);
            builder.stopProcessing();
            done();
        }, 4000);
    });

});
