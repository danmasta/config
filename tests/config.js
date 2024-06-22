describe('Config', () => {

    it('should be an object', () => {
        expect(conf).to.be.an('object');
        expect(sync).to.be.an('object');
    });

    it('should load default config', () => {
        expect(conf).to.have.property('test1');
        expect(conf).to.have.property('test2');
        expect(conf).to.have.property('test3');
        expect(conf).to.have.property('test4');
        expect(conf).to.have.property('host');
        expect(conf).to.have.property('port');
        expect(sync).to.have.property('test1');
        expect(sync).to.have.property('test2');
        expect(sync).to.have.property('test3');
        expect(sync).to.have.property('test4');
        expect(sync).to.have.property('host');
        expect(sync).to.have.property('port');
    });

    it('should export an immutable object', () => {
        expect(()=>{ conf.mutate = 1000 }).to.throw(TypeError);
        expect(()=>{ conf.port = 9999 }).to.throw(TypeError);
        expect(()=>{ sync.mutate = 1000 }).to.throw(TypeError);
        expect(()=>{ sync.port = 9999 }).to.throw(TypeError);
    });

    it('should load heirarchically and merge configs', () => {
        expect(conf.host).to.equal('localhost');
        expect(conf.port).to.equal(8080);
        expect(sync.host).to.equal('localhost');
        expect(sync.port).to.equal(8080);
    });

});
