build: components
	component build --copy --out . --name hn-button --standalone HN
	uglifyjs --no-copyright --output hn-button.min.js hn-button.js
	component build --out ./test --name hn-button.test --standalone HN #test build

clean:
	rm -fr components build

components: component.json
	component install --dev

test:
	open test

.PHONY: test