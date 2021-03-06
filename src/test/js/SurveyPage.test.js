// Instructions
// Need babel.config.js
// Need to add enzyme and babel to package.json
// Add "jest" to package.json
// Add __mocks__ with fileMock.js and styleMock.js
// Must configure enzyme
//      - the import adapter steps below

import React from 'react';
import ReactDOM from 'react-dom';
import { shallow, render, mount } from 'enzyme';
import CreatePage from '../../main/js/CreatePage';
import Button from '@material-ui/core/Button';
import Select from '@material-ui/core/Select';
import TextField from '@material-ui/core/TextField';

import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';
import { enableFetchMocks } from 'jest-fetch-mock';
configure({ adapter: new Adapter() });

enableFetchMocks();

describe('Test rendering', () => {
   it('perform a shallow render without crashing', () => {
        shallow(<CreatePage />);
   });
   it('perform a full render without crashing', () => {
        mount(<CreatePage />);
   });
});

describe('Test adding questions', () => {
   it('No question adding', () => {
        let wrapper = shallow(<CreatePage />);

        wrapper.find(Button).find({ label: "Add Question" }).at(0).simulate('click');
        expect(wrapper.find({ label: "Open Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Number Question Input" }).length).toBe(0);
   });

   it('Add a single open question', () => {
        let wrapper = shallow(<CreatePage />);

        wrapper.find(Select).find({ labelId: "qtype_select_label" }).at(0).simulate('change', { target: { value: "openEnded" } } );
        expect(wrapper.find({ label: "Open Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Number Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Dropdown Question Input" }).length).toBe(0);

        wrapper.find(Button).find({ label: "Add Question" }).at(0).simulate('click');
        expect(wrapper.find({ label: "Open Question Input" }).length).toBe(1);
        expect(wrapper.find({ label: "Number Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Dropdown Question Input" }).length).toBe(0);
   });

   it('Add a single number questions', () => {
        let wrapper = shallow(<CreatePage />);

        wrapper.find(Select).find({ labelId: "qtype_select_label" }).at(0).simulate('change', { target: { value: "numberQuestion" } } );
        expect(wrapper.find({ label: "Open Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Number Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Dropdown Question Input" }).length).toBe(0);

        wrapper.find(Button).find({ label: "Add Question" }).at(0).simulate('click');
        expect(wrapper.find({ label: "Open Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Number Question Input" }).length).toBe(1);
        expect(wrapper.find({ label: "Dropdown Question Input" }).length).toBe(0);
   });

   it('Add a single dropdown questions', () => {
        let wrapper = shallow(<CreatePage />);

        wrapper.find(Select).find({ labelId: "qtype_select_label" }).at(0).simulate('change', { target: { value: "dropdown" } } );
        expect(wrapper.find({ label: "Open Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Number Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Dropdown Question Input" }).length).toBe(0);

        wrapper.find(Button).find({ label: "Add Question" }).at(0).simulate('click');
        expect(wrapper.find({ label: "Open Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Number Question Input" }).length).toBe(0);
        expect(wrapper.find({ label: "Dropdown Question Input" }).length).toBe(1);
   });

   it('Add a question', () => {

        let wrapper = shallow(<CreatePage />);
        let sumOpen = 0;
        let sumNumber = 0;
        let sumDrop = 0
        let currentType = '';

        for (let i = 0; i < 10; i++) {
            // We test two things, do we change the value, and if so what is the new value
            let toChange = Math.random() < 0.5;
            if (toChange) {
                let rnum = Math.random();
                currentType = rnum < 0.33 ? 'openEnded' : (rnum < 0.66 ? 'numberQuestion' : 'dropdown');
                wrapper.find(Select).find({ labelId: "qtype_select_label" }).at(0).simulate('change', { target: { value: currentType } } );
            }
            wrapper.find(Button).find({ label: "Add Question" }).at(0).simulate('click');
            switch (currentType) {
                case 'openEnded':
                    sumOpen += 1;
                    break;
                case 'numberQuestion':
                    sumNumber += 1;
                    break;
                case 'dropdown':
                    sumDrop += 1;
                    break;
            }
            expect(wrapper.find({ label: "Open Question Input" }).length).toBe(sumOpen);
            expect(wrapper.find({ label: "Number Question Input" }).length).toBe(sumNumber);
            expect(wrapper.find({ label: "Dropdown Question Input" }).length).toBe(sumDrop);
        }
   });

   beforeEach(() => {
        fetch.resetMocks()
   });

   it('Save survey', (done) => {

        let createRequest;
        let createPromise;

        // uses 'jest-fetch-mock'
        fetch.mockResponse(req => {
            if (req.url.endsWith('createSurvey')) {
                createRequest = req;
                createPromise = Promise.resolve({
                    status: 200,
                    body  : JSON.stringify({ message : 'ok', id : 1 }),
                    json: () => Promise.resolve({ message : 'ok', id : 1 }),
                });
                return createPromise;
            } else if (req.url.endsWith("retrieveSurveyNames")) {
                return Promise.resolve({
                    status: 200,
                    body  : JSON.stringify({ nameList : ["Survey1"], idList : [1] }),
                    json: () => Promise.resolve({ nameList : ["Survey1"], idList : [1] }),
                });
            } else {
                return Promise.resolve({
                    status: 404,
                });
            }
        });

        let wrapper = shallow(<CreatePage />);

        wrapper.find(TextField).find({ label: "Survey Name" }).at(0).simulate('change', { target: { value: "Survey1" } } );
        wrapper.find(Select).find({ labelId: "qtype_select_label" }).at(0).simulate('change', { target: { value: "openEnded" } } );
        wrapper.find(Button).find({ label: "Add Question" }).at(0).simulate('click');
        wrapper.find(Select).find({ labelId: "qtype_select_label" }).at(0).simulate('change', { target: { value: "numberQuestion" } } );
        wrapper.find(Button).find({ label: "Add Question" }).at(0).simulate('click');
        wrapper.find(Select).find({ labelId: "qtype_select_label" }).at(0).simulate('change', { target: { value: "dropdown" } } );
        wrapper.find(Button).find({ label: "Add Question" }).at(0).simulate('click');

        wrapper.find(Button).find({ label: "Create Survey" }).at(0).simulate('click');

        expect(fetch).toHaveBeenCalledTimes(1);
        expect(createRequest.method).toBe('POST');
        expect(JSON.parse(createRequest.body).name).toBe('Survey1');

        expect(JSON.parse(createRequest.body).questions[0].type).toBe('openEnded');
        expect(JSON.parse(createRequest.body).questions[1].type).toBe('numberQuestion');
        expect(JSON.parse(createRequest.body).questions[2].type).toBe('dropdown');

        new Promise((resolve) => {
                setTimeout(resolve, 0);
            }).then().then().then().then(() => {
            expect(wrapper.find({ className: "mv15 link" }).at(0).props().value).toContain("/#/survey");
            done();
        });
   });
});
