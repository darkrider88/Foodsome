
	/**
	 * Choices
	 */
	var Choices = function () {
	  function Choices() {
	    var element = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '[data-choice]';
	    var userConfig = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    _classCallCheck(this, Choices);

	    // If there are multiple elements, create a new instance
	    // for each element besides the first one (as that already has an instance)
	    if ((0, _utils.isType)('String', element)) {
	      var elements = document.querySelectorAll(element);
	      if (elements.length > 1) {
	        for (var i = 1; i < elements.length; i++) {
	          var el = elements[i];
	          new Choices(el, userConfig);
	        }
	      }
	    }

	    var defaultConfig = {
	      silent: false,
	      items: [],
	      choices: [],
	      renderChoiceLimit: -1,
	      maxItemCount: -1,
	      addItems: true,
	      removeItems: true,
	      removeItemButton: false,
	      editItems: false,
	      duplicateItems: true,
	      delimiter: ',',
	      paste: true,
	      searchEnabled: true,
	      searchChoices: true,
	      searchFloor: 1,
	      searchResultLimit: 4,
	      searchFields: ['label', 'value'],
	      position: 'auto',
	      resetScrollPosition: true,
	      regexFilter: null,
	      shouldSort: true,
	      shouldSortItems: false,
	      sortFilter: _utils.sortByAlpha,
	      placeholder: true,
	      placeholderValue: null,
	      searchPlaceholderValue: null,
	      prependValue: null,
	      appendValue: null,
	      renderSelectedChoices: 'auto',
	      loadingText: 'Loading...',
	      noResultsText: 'No results found',
	      noChoicesText: 'No choices to choose from',
	      itemSelectText: 'Press to select',
	      addItemText: function addItemText(value) {
	        return 'Press Enter to add <b>"' + (0, _utils.stripHTML)(value) + '"</b>';
	      },
	      maxItemText: function maxItemText(maxItemCount) {
	        return 'Only ' + maxItemCount + ' values can be added.';
	      },
	      itemComparer: function itemComparer(choice, item) {
	        return choice === item;
	      },
	      uniqueItemText: 'Only unique values can be added.',
	      classNames: {
	        containerOuter: 'choices',
	        containerInner: 'choices__inner',
	        input: 'choices__input',
	        inputCloned: 'choices__input--cloned',
	        list: 'choices__list',
	        listItems: 'choices__list--multiple',
	        listSingle: 'choices__list--single',
	        listDropdown: 'choices__list--dropdown',
	        item: 'choices__item',
	        itemSelectable: 'choices__item--selectable',
	        itemDisabled: 'choices__item--disabled',
	        itemChoice: 'choices__item--choice',
	        placeholder: 'choices__placeholder',
	        group: 'choices__group',
	        groupHeading: 'choices__heading',
	        button: 'choices__button',
	        activeState: 'is-active',
	        focusState: 'is-focused',
	        openState: 'is-open',
	        disabledState: 'is-disabled',
	        highlightedState: 'is-highlighted',
	        hiddenState: 'is-hidden',
	        flippedState: 'is-flipped',
	        loadingState: 'is-loading',
	        noResults: 'has-no-results',
	        noChoices: 'has-no-choices'
	      },
	      fuseOptions: {
	        include: 'score'
	      },
	      callbackOnInit: null,
	      callbackOnCreateTemplates: null
	    };

	    this.idNames = {
	      itemChoice: 'item-choice'
	    };

	    // Merge options with user options
	    this.config = (0, _utils.extend)(defaultConfig, userConfig);

	    if (this.config.renderSelectedChoices !== 'auto' && this.config.renderSelectedChoices !== 'always') {
	      if (!this.config.silent) {
	        console.warn('renderSelectedChoices: Possible values are \'auto\' and \'always\'. Falling back to \'auto\'.');
	      }
	      this.config.renderSelectedChoices = 'auto';
	    }

	    // Create data store
	    this.store = new _index2.default(this.render);

	    // State tracking
	    this.initialised = false;
	    this.currentState = {};
	    this.prevState = {};
	    this.currentValue = '';

	    // Retrieve triggering element (i.e. element with 'data-choice' trigger)
	    this.element = element;
	    this.passedElement = (0, _utils.isType)('String', element) ? document.querySelector(element) : element;

	    if (!this.passedElement) {
	      if (!this.config.silent) {
	        console.error('Passed element not found');
	      }
	      return;
	    }

	    this.isTextElement = this.passedElement.type === 'text';
	    this.isSelectOneElement = this.passedElement.type === 'select-one';
	    this.isSelectMultipleElement = this.passedElement.type === 'select-multiple';
	    this.isSelectElement = this.isSelectOneElement || this.isSelectMultipleElement;
	    this.isValidElementType = this.isTextElement || this.isSelectElement;
	    this.isIe11 = !!(navigator.userAgent.match(/Trident/) && navigator.userAgent.match(/rv[ :]11/));
	    this.isScrollingOnIe = false;

	    if (this.config.shouldSortItems === true && this.isSelectOneElement) {
	      if (!this.config.silent) {
	        console.warn('shouldSortElements: Type of passed element is \'select-one\', falling back to false.');
	      }
	    }

	    this.highlightPosition = 0;
	    this.canSearch = this.config.searchEnabled;

	    this.placeholder = false;
	    if (!this.isSelectOneElement) {
	      this.placeholder = this.config.placeholder ? this.config.placeholderValue || this.passedElement.getAttribute('placeholder') : false;
	    }

	    // Assign preset choices from passed object
	    this.presetChoices = this.config.choices;

	    // Assign preset items from passed object first
	    this.presetItems = this.config.items;

	    // Then add any values passed from attribute
	    if (this.passedElement.value) {
	      this.presetItems = this.presetItems.concat(this.passedElement.value.split(this.config.delimiter));
	    }

	    // Set unique base Id
	    this.baseId = (0, _utils.generateId)(this.passedElement, 'choices-');

	    // Bind methods
	    this.render = this.render.bind(this);

	    // Bind event handlers
	    this._onFocus = this._onFocus.bind(this);
	    this._onBlur = this._onBlur.bind(this);
	    this._onKeyUp = this._onKeyUp.bind(this);
	    this._onKeyDown = this._onKeyDown.bind(this);
	    this._onClick = this._onClick.bind(this);
	    this._onTouchMove = this._onTouchMove.bind(this);
	    this._onTouchEnd = this._onTouchEnd.bind(this);
	    this._onMouseDown = this._onMouseDown.bind(this);
	    this._onMouseOver = this._onMouseOver.bind(this);
	    this._onPaste = this._onPaste.bind(this);
	    this._onInput = this._onInput.bind(this);

	    // Monitor touch taps/scrolls
	    this.wasTap = true;

	    // Cutting the mustard
	    var cuttingTheMustard = 'classList' in document.documentElement;
	    if (!cuttingTheMustard && !this.config.silent) {
	      console.error('Choices: Your browser doesn\'t support Choices');
	    }

	    var canInit = (0, _utils.isElement)(this.passedElement) && this.isValidElementType;

	    if (canInit) {
	      // If element has already been initialised with Choices
	      if (this.passedElement.getAttribute('data-choice') === 'active') {
	        return;
	      }

	      // Let's go
	      this.init();
	    } else if (!this.config.silent) {
	      console.error('Incompatible input passed');
	    }
	  }

	  /*========================================
	  =            Public functions            =
	  ========================================*/

	  /**
	   * Initialise Choices
	   * @return
	   * @public
	   */


	  _createClass(Choices, [{
	    key: 'init',
	    value: function init() {
	      if (this.initialised === true) {
	        return;
	      }

	      var callback = this.config.callbackOnInit;

	      // Set initialise flag
	      this.initialised = true;
	      // Create required elements
	      this._createTemplates();
	      // Generate input markup
	      this._createInput();
	      // Subscribe store to render method
	      this.store.subscribe(this.render);
	      // Render any items
	      this.render();
	      // Trigger event listeners
	      this._addEventListeners();

	      // Run callback if it is a function
	      if (callback) {
	        if ((0, _utils.isType)('Function', callback)) {
	          callback.call(this);
	        }
	      }
	    }

	    /**
	     * Destroy Choices and nullify values
	     * @return
	     * @public
	     */

	  }, {
	    key: 'destroy',
	    value: function destroy() {
	      if (this.initialised === false) {
	        return;
	      }

	      // Remove all event listeners
	      this._removeEventListeners();

	      // Reinstate passed element
	      this.passedElement.classList.remove(this.config.classNames.input, this.config.classNames.hiddenState);
	      this.passedElement.removeAttribute('tabindex');
	      // Recover original styles if any
	      var origStyle = this.passedElement.getAttribute('data-choice-orig-style');
	      if (Boolean(origStyle)) {
	        this.passedElement.removeAttribute('data-choice-orig-style');
	        this.passedElement.setAttribute('style', origStyle);
	      } else {
	        this.passedElement.removeAttribute('style');
	      }
	      this.passedElement.removeAttribute('aria-hidden');
	      this.passedElement.removeAttribute('data-choice');

	      // Re-assign values - this is weird, I know
	      this.passedElement.value = this.passedElement.value;

	      // Move passed element back to original position
	      this.containerOuter.parentNode.insertBefore(this.passedElement, this.containerOuter);
	      // Remove added elements
	      this.containerOuter.parentNode.removeChild(this.containerOuter);

	      // Clear data store
	      this.clearStore();

	      // Nullify instance-specific data
	      this.config.templates = null;

	      // Uninitialise
	      this.initialised = false;
	    }

	    /**
	     * Render group choices into a DOM fragment and append to choice list
	     * @param  {Array} groups    Groups to add to list
	     * @param  {Array} choices   Choices to add to groups
	     * @param  {DocumentFragment} fragment Fragment to add groups and options to (optional)
	     * @return {DocumentFragment} Populated options fragment
	     * @private
	     */

	  }, {
	    key: 'renderGroups',
	    value: function renderGroups(groups, choices, fragment) {
	      var _this = this;

	      var groupFragment = fragment || document.createDocumentFragment();
	      var filter = this.config.sortFilter;

	      // If sorting is enabled, filter groups
	      if (this.config.shouldSort) {
	        groups.sort(filter);
	      }

	      groups.forEach(function (group) {
	        // Grab options that are children of this group
	        var groupChoices = choices.filter(function (choice) {
	          if (_this.isSelectOneElement) {
	            return choice.groupId === group.id;
	          }
	          return choice.groupId === group.id && !choice.selected;
	        });

	        if (groupChoices.length >= 1) {
	          var dropdownGroup = _this._getTemplate('choiceGroup', group);
	          groupFragment.appendChild(dropdownGroup);
	          _this.renderChoices(groupChoices, groupFragment, true);
	        }
	      });

	      return groupFragment;
	    }

	    /**
	     * Render choices into a DOM fragment and append to choice list
	     * @param  {Array} choices    Choices to add to list
	     * @param  {DocumentFragment} fragment Fragment to add choices to (optional)
	     * @return {DocumentFragment} Populated choices fragment
	     * @private
	     */

	  }, {
	    key: 'renderChoices',
	    value: function renderChoices(choices, fragment) {
	      var _this2 = this;

	      var withinGroup = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	      // Create a fragment to store our list items (so we don't have to update the DOM for each item)
	      var choicesFragment = fragment || document.createDocumentFragment();
	      var _config = this.config,
	          renderSelectedChoices = _config.renderSelectedChoices,
	          searchResultLimit = _config.searchResultLimit,
	          renderChoiceLimit = _config.renderChoiceLimit;

	      var filter = this.isSearching ? _utils.sortByScore : this.config.sortFilter;
	      var appendChoice = function appendChoice(choice) {
	        var shouldRender = renderSelectedChoices === 'auto' ? _this2.isSelectOneElement || !choice.selected : true;
	        if (shouldRender) {
	          var dropdownItem = _this2._getTemplate('choice', choice);
	          choicesFragment.appendChild(dropdownItem);
	        }
	      };

	      var rendererableChoices = choices;

	      if (renderSelectedChoices === 'auto' && !this.isSelectOneElement) {
	        rendererableChoices = choices.filter(function (choice) {
	          return !choice.selected;
	        });
	      }

	      // Split array into placeholders and "normal" choices

	      var _rendererableChoices$ = rendererableChoices.reduce(function (acc, choice) {
	        if (choice.placeholder) {
	          acc.placeholderChoices.push(choice);
	        } else {
	          acc.normalChoices.push(choice);
	        }
	        return acc;
	      }, { placeholderChoices: [], normalChoices: [] }),
	          placeholderChoices = _rendererableChoices$.placeholderChoices,
	          normalChoices = _rendererableChoices$.normalChoices;

	      // If sorting is enabled or the user is searching, filter choices


	      if (this.config.shouldSort || this.isSearching) {
	        normalChoices.sort(filter);
	      }

	      var choiceLimit = rendererableChoices.length;

	      // Prepend placeholeder
	      var sortedChoices = [].concat(_toConsumableArray(placeholderChoices), _toConsumableArray(normalChoices));

	      if (this.isSearching) {
	        choiceLimit = searchResultLimit;
	      } else if (renderChoiceLimit > 0 && !withinGroup) {
	        choiceLimit = renderChoiceLimit;
	      }

	      // Add each choice to dropdown within range
	      for (var i = 0; i < choiceLimit; i++) {
	        if (sortedChoices[i]) {
	          appendChoice(sortedChoices[i]);
	        }
	      };

	      return choicesFragment;
	    }

	    /**
	     * Render items into a DOM fragment and append to items list
	     * @param  {Array} items    Items to add to list
	     * @param  {DocumentFragment} [fragment] Fragment to add items to (optional)
	     * @return
	     * @private
	     */

	  }, {
	    key: 'renderItems',
	    value: function renderItems(items) {
	      var _this3 = this;

	      var fragment = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	      // Create fragment to add elements to
	      var itemListFragment = fragment || document.createDocumentFragment();

	      // If sorting is enabled, filter items
	      if (this.config.shouldSortItems && !this.isSelectOneElement) {
	        items.sort(this.config.sortFilter);
	      }

	      if (this.isTextElement) {
	        // Simplify store data to just values
	        var itemsFiltered = this.store.getItemsReducedToValues(items);
	        var itemsFilteredString = itemsFiltered.join(this.config.delimiter);
	        // Update the value of the hidden input
	        this.passedElement.setAttribute('value', itemsFilteredString);
	        this.passedElement.value = itemsFilteredString;
	      } else {
	        var selectedOptionsFragment = document.createDocumentFragment();

	        // Add each list item to list
	        items.forEach(function (item) {
	          // Create a standard select option
	          var option = _this3._getTemplate('option', item);
	          // Append it to fragment
	          selectedOptionsFragment.appendChild(option);
	        });

	        // Update selected choices
	        this.passedElement.innerHTML = '';
	        this.passedElement.appendChild(selectedOptionsFragment);
	      }

	      // Add each list item to list
	      items.forEach(function (item) {
	        // Create new list element
	        var listItem = _this3._getTemplate('item', item);
	        // Append it to list
	        itemListFragment.appendChild(listItem);
	      });

	      return itemListFragment;
	    }

	    /**
	     * Render DOM with values
	     * @return
	     * @private
	     */

	  }, {
	    key: 'render',
	    value: function render() {
	      if (this.store.isLoading()) {
	        return;
	      }

	      this.currentState = this.store.getState();

	      // Only render if our state has actually changed
	      if (this.currentState !== this.prevState) {
	        // Choices
	        if (this.currentState.choices !== this.prevState.choices || this.currentState.groups !== this.prevState.groups || this.currentState.items !== this.prevState.items) {
	          if (this.isSelectElement) {
	            // Get active groups/choices
	            var activeGroups = this.store.getGroupsFilteredByActive();
	            var activeChoices = this.store.getChoicesFilteredByActive();

	            var choiceListFragment = document.createDocumentFragment();

	            // Clear choices
	            this.choiceList.innerHTML = '';

	            // Scroll back to top of choices list
	            if (this.config.resetScrollPosition) {
	              this.choiceList.scrollTop = 0;
	            }

	            // If we have grouped options
	            if (activeGroups.length >= 1 && this.isSearching !== true) {
	              choiceListFragment = this.renderGroups(activeGroups, activeChoices, choiceListFragment);
	            } else if (activeChoices.length >= 1) {
	              choiceListFragment = this.renderChoices(activeChoices, choiceListFragment);
	            }

	            var activeItems = this.store.getItemsFilteredByActive();
	            var canAddItem = this._canAddItem(activeItems, this.input.value);

	            // If we have choices to show
	            if (choiceListFragment.childNodes && choiceListFragment.childNodes.length > 0) {
	              // ...and we can select them
	              if (canAddItem.response) {
	                // ...append them and highlight the first choice
	                this.choiceList.appendChild(choiceListFragment);
	                this._highlightChoice();
	              } else {
	                // ...otherwise show a notice
	                this.choiceList.appendChild(this._getTemplate('notice', canAddItem.notice));
	              }
	            } else {
	              // Otherwise show a notice
	              var dropdownItem = void 0;
	              var notice = void 0;

	              if (this.isSearching) {
	                notice = (0, _utils.isType)('Function', this.config.noResultsText) ? this.config.noResultsText() : this.config.noResultsText;

	                dropdownItem = this._getTemplate('notice', notice, 'no-results');
	              } else {
	                notice = (0, _utils.isType)('Function', this.config.noChoicesText) ? this.config.noChoicesText() : this.config.noChoicesText;

	                dropdownItem = this._getTemplate('notice', notice, 'no-choices');
	              }

	              this.choiceList.appendChild(dropdownItem);
	            }
	          }
	        }

	        // Items
	        if (this.currentState.items !== this.prevState.items) {
	          // Get active items (items that can be selected)
	          var _activeItems = this.store.getItemsFilteredByActive();

	          // Clear list
	          this.itemList.innerHTML = '';

	          if (_activeItems && _activeItems) {
	            // Create a fragment to store our list items
	            // (so we don't have to update the DOM for each item)
	            var itemListFragment = this.renderItems(_activeItems);

	            // If we have items to add
	            if (itemListFragment.childNodes) {
	              // Update list
	              this.itemList.appendChild(itemListFragment);
	            }
	          }
	        }

	        this.prevState = this.currentState;
	      }
	    }

	    /**
	     * Select item (a selected item can be deleted)
	     * @param  {Element} item Element to select
	     * @param  {Boolean} [runEvent=true] Whether to trigger 'highlightItem' event
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'highlightItem',
	    value: function highlightItem(item) {
	      var runEvent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

	      if (!item) {
	        return this;
	      }

	      var id = item.id;
	      var groupId = item.groupId;
	      var group = groupId >= 0 ? this.store.getGroupById(groupId) : null;

	      this.store.dispatch((0, _index3.highlightItem)(id, true));

	      if (runEvent) {
	        if (group && group.value) {
	          (0, _utils.triggerEvent)(this.passedElement, 'highlightItem', {
	            id: id,
	            value: item.value,
	            label: item.label,
	            groupValue: group.value
	          });
	        } else {
	          (0, _utils.triggerEvent)(this.passedElement, 'highlightItem', {
	            id: id,
	            value: item.value,
	            label: item.label
	          });
	        }
	      }

	      return this;
	    }

	    /**
	     * Deselect item
	     * @param  {Element} item Element to de-select
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'unhighlightItem',
	    value: function unhighlightItem(item) {
	      if (!item) {
	        return this;
	      }

	      var id = item.id;
	      var groupId = item.groupId;
	      var group = groupId >= 0 ? this.store.getGroupById(groupId) : null;

	      this.store.dispatch((0, _index3.highlightItem)(id, false));

	      if (group && group.value) {
	        (0, _utils.triggerEvent)(this.passedElement, 'unhighlightItem', {
	          id: id,
	          value: item.value,
	          label: item.label,
	          groupValue: group.value
	        });
	      } else {
	        (0, _utils.triggerEvent)(this.passedElement, 'unhighlightItem', {
	          id: id,
	          value: item.value,
	          label: item.label
	        });
	      }

	      return this;
	    }

	    /**
	     * Highlight items within store
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'highlightAll',
	    value: function highlightAll() {
	      var _this4 = this;

	      var items = this.store.getItems();
	      items.forEach(function (item) {
	        _this4.highlightItem(item);
	      });

	      return this;
	    }

	    /**
	     * Deselect items within store
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'unhighlightAll',
	    value: function unhighlightAll() {
	      var _this5 = this;

	      var items = this.store.getItems();
	      items.forEach(function (item) {
	        _this5.unhighlightItem(item);
	      });

	      return this;
	    }

	    /**
	     * Remove an item from the store by its value
	     * @param  {String} value Value to search for
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'removeItemsByValue',
	    value: function removeItemsByValue(value) {
	      var _this6 = this;

	      if (!value || !(0, _utils.isType)('String', value)) {
	        return this;
	      }

	      var items = this.store.getItemsFilteredByActive();

	      items.forEach(function (item) {
	        if (item.value === value) {
	          _this6._removeItem(item);
	        }
	      });

	      return this;
	    }

	    /**
	     * Remove all items from store array
	     * @note Removed items are soft deleted
	     * @param  {Number} excludedId Optionally exclude item by ID
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'removeActiveItems',
	    value: function removeActiveItems(excludedId) {
	      var _this7 = this;

	      var items = this.store.getItemsFilteredByActive();

	      items.forEach(function (item) {
	        if (item.active && excludedId !== item.id) {
	          _this7._removeItem(item);
	        }
	      });

	      return this;
	    }

	    /**
	     * Remove all selected items from store
	     * @note Removed items are soft deleted
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'removeHighlightedItems',
	    value: function removeHighlightedItems() {
	      var _this8 = this;

	      var runEvent = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	      var items = this.store.getItemsFilteredByActive();

	      items.forEach(function (item) {
	        if (item.highlighted && item.active) {
	          _this8._removeItem(item);
	          // If this action was performed by the user
	          // trigger the event
	          if (runEvent) {
	            _this8._triggerChange(item.value);
	          }
	        }
	      });

	      return this;
	    }

	    /**
	     * Show dropdown to user by adding active state class
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'showDropdown',
	    value: function showDropdown() {
	      var focusInput = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	      var body = document.body;
	      var html = document.documentElement;
	      var winHeight = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);

	      this.containerOuter.classList.add(this.config.classNames.openState);
	      this.containerOuter.setAttribute('aria-expanded', 'true');
	      this.dropdown.classList.add(this.config.classNames.activeState);
	      this.dropdown.setAttribute('aria-expanded', 'true');

	      var dimensions = this.dropdown.getBoundingClientRect();
	      var dropdownPos = Math.ceil(dimensions.top + window.scrollY + this.dropdown.offsetHeight);

	      // If flip is enabled and the dropdown bottom position is greater than the window height flip the dropdown.
	      var shouldFlip = false;
	      if (this.config.position === 'auto') {
	        shouldFlip = dropdownPos >= winHeight;
	      } else if (this.config.position === 'top') {
	        shouldFlip = true;
	      }

	      if (shouldFlip) {
	        this.containerOuter.classList.add(this.config.classNames.flippedState);
	      }

	      // Optionally focus the input if we have a search input
	      if (focusInput && this.canSearch && document.activeElement !== this.input) {
	        this.input.focus();
	      }

	      (0, _utils.triggerEvent)(this.passedElement, 'showDropdown', {});

	      return this;
	    }

	    /**
	     * Hide dropdown from user
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'hideDropdown',
	    value: function hideDropdown() {
	      var blurInput = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	      // A dropdown flips if it does not have space within the page
	      var isFlipped = this.containerOuter.classList.contains(this.config.classNames.flippedState);

	      this.containerOuter.classList.remove(this.config.classNames.openState);
	      this.containerOuter.setAttribute('aria-expanded', 'false');
	      this.dropdown.classList.remove(this.config.classNames.activeState);
	      this.dropdown.setAttribute('aria-expanded', 'false');

	      if (isFlipped) {
	        this.containerOuter.classList.remove(this.config.classNames.flippedState);
	      }

	      // Optionally blur the input if we have a search input
	      if (blurInput && this.canSearch && document.activeElement === this.input) {
	        this.input.blur();
	      }

	      (0, _utils.triggerEvent)(this.passedElement, 'hideDropdown', {});

	      return this;
	    }

	    /**
	     * Determine whether to hide or show dropdown based on its current state
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'toggleDropdown',
	    value: function toggleDropdown() {
	      var hasActiveDropdown = this.dropdown.classList.contains(this.config.classNames.activeState);
	      if (hasActiveDropdown) {
	        this.hideDropdown();
	      } else {
	        this.showDropdown(true);
	      }

	      return this;
	    }

	    /**
	     * Get value(s) of input (i.e. inputted items (text) or selected choices (select))
	     * @param {Boolean} valueOnly Get only values of selected items, otherwise return selected items
	     * @return {Array/String} selected value (select-one) or array of selected items (inputs & select-multiple)
	     * @public
	     */

	  }, {
	    key: 'getValue',
	    value: function getValue() {
	      var _this9 = this;

	      var valueOnly = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	      var items = this.store.getItemsFilteredByActive();
	      var selectedItems = [];

	      items.forEach(function (item) {
	        if (_this9.isTextElement) {
	          selectedItems.push(valueOnly ? item.value : item);
	        } else if (item.active) {
	          selectedItems.push(valueOnly ? item.value : item);
	        }
	      });

	      if (this.isSelectOneElement) {
	        return selectedItems[0];
	      }

	      return selectedItems;
	    }

	    /**
	     * Set value of input. If the input is a select box, a choice will be created and selected otherwise
	     * an item will created directly.
	     * @param  {Array}   args  Array of value objects or value strings
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'setValue',
	    value: function setValue(args) {
	      var _this10 = this;

	      if (this.initialised === true) {
	        // Convert args to an iterable array
	        var values = [].concat(_toConsumableArray(args)),
	            handleValue = function handleValue(item) {
	          var itemType = (0, _utils.getType)(item);
	          if (itemType === 'Object') {
	            if (!item.value) {
	              return;
	            }

	            // If we are dealing with a select input, we need to create an option first
	            // that is then selected. For text inputs we can just add items normally.
	            if (!_this10.isTextElement) {
	              _this10._addChoice(item.value, item.label, true, false, -1, item.customProperties, item.placeholder);
	            } else {
	              _this10._addItem(item.value, item.label, item.id, undefined, item.customProperties, item.placeholder);
	            }
	          } else if (itemType === 'String') {
	            if (!_this10.isTextElement) {
	              _this10._addChoice(item, item, true, false, -1, null);
	            } else {
	              _this10._addItem(item);
	            }
	          }
	        };

	        if (values.length > 1) {
	          values.forEach(function (value) {
	            handleValue(value);
	          });
	        } else {
	          handleValue(values[0]);
	        }
	      }
	      return this;
	    }

	    /**
	     * Select value of select box via the value of an existing choice
	     * @param {Array/String} value An array of strings of a single string
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'setValueByChoice',
	    value: function setValueByChoice(value) {
	      var _this11 = this;

	      if (!this.isTextElement) {
	        var choices = this.store.getChoices();
	        // If only one value has been passed, convert to array
	        var choiceValue = (0, _utils.isType)('Array', value) ? value : [value];

	        // Loop through each value and
	        choiceValue.forEach(function (val) {
	          var foundChoice = choices.find(function (choice) {
	            // Check 'value' property exists and the choice isn't already selected
	            return _this11.config.itemComparer(choice.value, val);
	          });

	          if (foundChoice) {
	            if (!foundChoice.selected) {
	              _this11._addItem(foundChoice.value, foundChoice.label, foundChoice.id, foundChoice.groupId, foundChoice.customProperties, foundChoice.placeholder, foundChoice.keyCode);
	            } else if (!_this11.config.silent) {
	              console.warn('Attempting to select choice already selected');
	            }
	          } else if (!_this11.config.silent) {
	            console.warn('Attempting to select choice that does not exist');
	          }
	        });
	      }
	      return this;
	    }

	    /**
	     * Direct populate choices
	     * @param  {Array} choices - Choices to insert
	     * @param  {String} value - Name of 'value' property
	     * @param  {String} label - Name of 'label' property
	     * @param  {Boolean} replaceChoices Whether existing choices should be removed
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'setChoices',
	    value: function setChoices(choices, value, label) {
	      var _this12 = this;

	      var replaceChoices = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;

	      if (this.initialised === true) {
	        if (this.isSelectElement) {
	          if (!(0, _utils.isType)('Array', choices) || !value) {
	            return this;
	          }

	          // Clear choices if needed
	          if (replaceChoices) {
	            this._clearChoices();
	          }

	          this._setLoading(true);

	          // Add choices if passed
	          if (choices && choices.length) {
	            this.containerOuter.classList.remove(this.config.classNames.loadingState);
	            choices.forEach(function (result) {
	              if (result.choices) {
	                _this12._addGroup(result, result.id || null, value, label);
	              } else {
	                _this12._addChoice(result[value], result[label], result.selected, result.disabled, undefined, result.customProperties, result.placeholder);
	              }
	            });
	          }

	          this._setLoading(false);
	        }
	      }
	      return this;
	    }

	    /**
	     * Clear items,choices and groups
	     * @note Hard delete
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'clearStore',
	    value: function clearStore() {
	      this.store.dispatch((0, _index3.clearAll)());
	      return this;
	    }

	    /**
	     * Set value of input to blank
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'clearInput',
	    value: function clearInput() {
	      if (this.input.value) {
	        this.input.value = '';
	      }
	      if (!this.isSelectOneElement) {
	        this._setInputWidth();
	      }
	      if (!this.isTextElement && this.config.searchEnabled) {
	        this.isSearching = false;
	        this.store.dispatch((0, _index3.activateChoices)(true));
	      }
	      return this;
	    }

	    /**
	     * Enable interaction with Choices
	     * @return {Object} Class instance
	     */

	  }, {
	    key: 'enable',
	    value: function enable() {
	      if (this.initialised) {
	        this.passedElement.disabled = false;
	        var isDisabled = this.containerOuter.classList.contains(this.config.classNames.disabledState);
	        if (isDisabled) {
	          this._addEventListeners();
	          this.passedElement.removeAttribute('disabled');
	          this.input.removeAttribute('disabled');
	          this.containerOuter.classList.remove(this.config.classNames.disabledState);
	          this.containerOuter.removeAttribute('aria-disabled');
	          if (this.isSelectOneElement) {
	            this.containerOuter.setAttribute('tabindex', '0');
	          }
	        }
	      }
	      return this;
	    }

	    /**
	     * Disable interaction with Choices
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'disable',
	    value: function disable() {
	      if (this.initialised) {
	        this.passedElement.disabled = true;
	        var isEnabled = !this.containerOuter.classList.contains(this.config.classNames.disabledState);
	        if (isEnabled) {
	          this._removeEventListeners();
	          this.passedElement.setAttribute('disabled', '');
	          this.input.setAttribute('disabled', '');
	          this.containerOuter.classList.add(this.config.classNames.disabledState);
	          this.containerOuter.setAttribute('aria-disabled', 'true');
	          if (this.isSelectOneElement) {
	            this.containerOuter.setAttribute('tabindex', '-1');
	          }
	        }
	      }
	      return this;
	    }

	    /**
	     * Populate options via ajax callback
	     * @param  {Function} fn Function that actually makes an AJAX request
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: 'ajax',
	    value: function ajax(fn) {
	      var _this13 = this;

	      if (this.initialised === true) {
	        if (this.isSelectElement) {
	          // Show loading text
	          requestAnimationFrame(function () {
	            _this13._handleLoadingState(true);
	          });
	          // Run callback
	          fn(this._ajaxCallback());
	        }
	      }
	      return this;
	    }

	    /*=====  End of Public functions  ======*/

	    /*=============================================
	    =                Private functions            =
	    =============================================*/

	    /**
	     * Call change callback
	     * @param  {String} value - last added/deleted/selected value
	     * @return
	     * @private
	     */

	  }, {
	    key: '_triggerChange',
	    value: function _triggerChange(value) {
	      if (!value) {
	        return;
	      }

	      (0, _utils.triggerEvent)(this.passedElement, 'change', {
	        value: value
	      });
	    }

	    /**
	     * Process enter/click of an item button
	     * @param {Array} activeItems The currently active items
	     * @param  {Element} element Button being interacted with
	     * @return
	     * @private
	     */

	  }, {
	    key: '_handleButtonAction',
	    value: function _handleButtonAction(activeItems, element) {
	      if (!activeItems || !element) {
	        return;
	      }

	      // If we are clicking on a button
	      if (this.config.removeItems && this.config.removeItemButton) {
	        var itemId = element.parentNode.getAttribute('data-id');
	        var itemToRemove = activeItems.find(function (item) {
	          return item.id === parseInt(itemId, 10);
	        });

	        // Remove item associated with button
	        this._removeItem(itemToRemove);
	        this._triggerChange(itemToRemove.value);

	        if (this.isSelectOneElement) {
	          this._selectPlaceholderChoice();
	        }
	      }
	    }

	    /**
	     * Select placeholder choice
	     */

	  }, {
	    key: '_selectPlaceholderChoice',
	    value: function _selectPlaceholderChoice() {
	      var placeholderChoice = this.store.getPlaceholderChoice();

	      if (placeholderChoice) {
	        this._addItem(placeholderChoice.value, placeholderChoice.label, placeholderChoice.id, placeholderChoice.groupId, null, placeholderChoice.placeholder);
	        this._triggerChange(placeholderChoice.value);
	      }
	    }

	    /**
	     * Process click of an item
	     * @param {Array} activeItems The currently active items
	     * @param  {Element} element Item being interacted with
	     * @param  {Boolean} hasShiftKey Whether the user has the shift key active
	     * @return
	     * @private
	     */

	  }, {
	    key: '_handleItemAction',
	    value: function _handleItemAction(activeItems, element) {
	      var _this14 = this;

	      var hasShiftKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	      if (!activeItems || !element) {
	        return;
	      }

	      // If we are clicking on an item
	      if (this.config.removeItems && !this.isSelectOneElement) {
	        var passedId = element.getAttribute('data-id');

	        // We only want to select one item with a click
	        // so we deselect any items that aren't the target
	        // unless shift is being pressed
	        activeItems.forEach(function (item) {
	          if (item.id === parseInt(passedId, 10) && !item.highlighted) {
	            _this14.highlightItem(item);
	          } else if (!hasShiftKey) {
	            if (item.highlighted) {
	              _this14.unhighlightItem(item);
	            }
	          }
	        });

	        // Focus input as without focus, a user cannot do anything with a
	        // highlighted item
	        if (document.activeElement !== this.input) {
	          this.input.focus();
	        }
	      }
	    }

	    /**
	     * Process click of a choice
	     * @param {Array} activeItems The currently active items
	     * @param  {Element} element Choice being interacted with
	     * @return
	     */

	  }, {
	    key: '_handleChoiceAction',
	    value: function _handleChoiceAction(activeItems, element) {
	      if (!activeItems || !element) {
	        return;
	      }

	      // If we are clicking on an option
	      var id = element.getAttribute('data-id');
	      var choice = this.store.getChoiceById(id);
	      var passedKeyCode = activeItems[0] && activeItems[0].keyCode ? activeItems[0].keyCode : null;
	      var hasActiveDropdown = this.dropdown.classList.contains(this.config.classNames.activeState);

	      // Update choice keyCode
	      choice.keyCode = passedKeyCode;

	      (0, _utils.triggerEvent)(this.passedElement, 'choice', {
	        choice: choice
	      });

	      if (choice && !choice.selected && !choice.disabled) {
	        var canAddItem = this._canAddItem(activeItems, choice.value);

	        if (canAddItem.response) {
	          this._addItem(choice.value, choice.label, choice.id, choice.groupId, choice.customProperties, choice.placeholder, choice.keyCode);
	          this._triggerChange(choice.value);
	        }
	      }

	      this.clearInput();

	      // We wont to close the dropdown if we are dealing with a single select box
	      if (hasActiveDropdown && this.isSelectOneElement) {
	        this.hideDropdown();
	        this.containerOuter.focus();
	      }
	    }

	    /**
	     * Process back space event
	     * @param  {Array} activeItems items
	     * @return
	     * @private
	     */

	  }, {
	    key: '_handleBackspace',
	    value: function _handleBackspace(activeItems) {
	      if (this.config.removeItems && activeItems) {
	        var lastItem = activeItems[activeItems.length - 1];
	        var hasHighlightedItems = activeItems.some(function (item) {
	          return item.highlighted;
	        });

	        // If editing the last item is allowed and there are not other selected items,
	        // we can edit the item value. Otherwise if we can remove items, remove all selected items
	        if (this.config.editItems && !hasHighlightedItems && lastItem) {
	          this.input.value = lastItem.value;
	          this._setInputWidth();
	          this._removeItem(lastItem);
	          this._triggerChange(lastItem.value);
	        } else {
	          if (!hasHighlightedItems) {
	            this.highlightItem(lastItem, false);
	          }
	          this.removeHighlightedItems(true);
	        }
	      }
	    }

	    /**
	     * Validates whether an item can be added by a user
	     * @param {Array} activeItems The currently active items
	     * @param  {String} value     Value of item to add
	     * @return {Object}           Response: Whether user can add item
	     *                            Notice: Notice show in dropdown
	     */

	  }, {
	    key: '_canAddItem',
	    value: function _canAddItem(activeItems, value) {
	      var canAddItem = true;
	      var notice = (0, _utils.isType)('Function', this.config.addItemText) ? this.config.addItemText(value) : this.config.addItemText;

	      if (this.isSelectMultipleElement || this.isTextElement) {
	        if (this.config.maxItemCount > 0 && this.config.maxItemCount <= activeItems.length) {
	          // If there is a max entry limit and we have reached that limit
	          // don't update
	          canAddItem = false;
	          notice = (0, _utils.isType)('Function', this.config.maxItemText) ? this.config.maxItemText(this.config.maxItemCount) : this.config.maxItemText;
	        }
	      }

	      if (this.isTextElement && this.config.addItems && canAddItem) {
	        // If a user has supplied a regular expression filter
	        if (this.config.regexFilter) {
	          // Determine whether we can update based on whether
	          // our regular expression passes
	          canAddItem = this._regexFilter(value);
	        }
	      }

	      // If no duplicates are allowed, and the value already exists
	      // in the array
	      var isUnique = !activeItems.some(function (item) {
	        if ((0, _utils.isType)('String', value)) {
	          return item.value === value.trim();
	        }

	        return item.value === value;
	      });

	      if (!isUnique && !this.config.duplicateItems && !this.isSelectOneElement && canAddItem) {
	        canAddItem = false;
	        notice = (0, _utils.isType)('Function', this.config.uniqueItemText) ? this.config.uniqueItemText(value) : this.config.uniqueItemText;
	      }

	      return {
	        response: canAddItem,
	        notice: notice
	      };
	    }

	    /**
	     * Apply or remove a loading state to the component.
	     * @param {Boolean} setLoading default value set to 'true'.
	     * @return
	     * @private
	     */

	  }, {
	    key: '_handleLoadingState',
	    value: function _handleLoadingState() {
	      var setLoading = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;

	      var placeholderItem = this.itemList.querySelector('.' + this.config.classNames.placeholder);
	      if (setLoading) {
	        this.containerOuter.classList.add(this.config.classNames.loadingState);
	        this.containerOuter.setAttribute('aria-busy', 'true');
	        if (this.isSelectOneElement) {
	          if (!placeholderItem) {
	            placeholderItem = this._getTemplate('placeholder', this.config.loadingText);
	            this.itemList.appendChild(placeholderItem);
	          } else {
	            placeholderItem.innerHTML = this.config.loadingText;
	          }
	        } else {
	          this.input.placeholder = this.config.loadingText;
	        }
	      } else {
	        // Remove loading states/text
	        this.containerOuter.classList.remove(this.config.classNames.loadingState);

	        if (this.isSelectOneElement) {
	          placeholderItem.innerHTML = this.placeholder || '';
	        } else {
	          this.input.placeholder = this.placeholder || '';
	        }
	      }
	    }

	    /**
	     * Retrieve the callback used to populate component's choices in an async way.
	     * @returns {Function} The callback as a function.
	     * @private
	     */

	  }, {
	    key: '_ajaxCallback',
	    value: function _ajaxCallback() {
	      var _this15 = this;

	      return function (results, value, label) {
	        if (!results || !value) {
	          return;
	        }

	        var parsedResults = (0, _utils.isType)('Object', results) ? [results] : results;

	        if (parsedResults && (0, _utils.isType)('Array', parsedResults) && parsedResults.length) {
	          // Remove loading states/text
	          _this15._handleLoadingState(false);
	          // Add each result as a choice

	          _this15._setLoading(true);

	          parsedResults.forEach(function (result) {
	            if (result.choices) {
	              var groupId = result.id || null;
	              _this15._addGroup(result, groupId, value, label);
	            } else {
	              _this15._addChoice(result[value], result[label], result.selected, result.disabled, undefined, result.customProperties, result.placeholder);
	            }
	          });

	          _this15._setLoading(false);

	          if (_this15.isSelectOneElement) {
	            _this15._selectPlaceholderChoice();
	          }
	        } else {
	          // No results, remove loading state
	          _this15._handleLoadingState(false);
	        }

	        _this15.containerOuter.removeAttribute('aria-busy');
	      };
	    }

	    /**
	     * Filter choices based on search value
	     * @param  {String} value Value to filter by
	     * @return
	     * @private
	     */

	  }, {
	    key: '_searchChoices',
	    value: function _searchChoices(value) {
	      var newValue = (0, _utils.isType)('String', value) ? value.trim() : value;
	      var currentValue = (0, _utils.isType)('String', this.currentValue) ? this.currentValue.trim() : this.currentValue;

	      // If new value matches the desired length and is not the same as the current value with a space
	      if (newValue.length >= 1 && newValue !== currentValue + ' ') {
	        var haystack = this.store.getSearchableChoices();
	        var needle = newValue;
	        var keys = (0, _utils.isType)('Array', this.config.searchFields) ? this.config.searchFields : [this.config.searchFields];
	        var options = Object.assign(this.config.fuseOptions, { keys: keys });
	        var fuse = new _fuse2.default(haystack, options);
	        var results = fuse.search(needle);

	        this.currentValue = newValue;
	        this.highlightPosition = 0;
	        this.isSearching = true;
	        this.store.dispatch((0, _index3.filterChoices)(results));

	        return results.length;
	      }

	      return 0;
	    }

	    /**
	     * Determine the action when a user is searching
	     * @param  {String} value Value entered by user
	     * @return
	     * @private
	     */

	  }, {
	    key: '_handleSearch',
	    value: function _handleSearch(value) {
	      if (!value) {
	        return;
	      }

	      var choices = this.store.getChoices();
	      var hasUnactiveChoices = choices.some(function (option) {
	        return !option.active;
	      });

	      // Run callback if it is a function
	      if (this.input === document.activeElement) {
	        // Check that we have a value to search and the input was an alphanumeric character
	        if (value && value.length >= this.config.searchFloor) {
	          var resultCount = 0;
	          // Check flag to filter search input
	          if (this.config.searchChoices) {
	            // Filter available choices
	            resultCount = this._searchChoices(value);
	          }
	          // Trigger search event
	          (0, _utils.triggerEvent)(this.passedElement, 'search', {
	            value: value,
	            resultCount: resultCount
	          });
	        } else if (hasUnactiveChoices) {
	          // Otherwise reset choices to active
	          this.isSearching = false;
	          this.store.dispatch((0, _index3.activateChoices)(true));
	        }
	      }
	    }

	    /**
	     * Trigger event listeners
	     * @return
	     * @private
	     */

	  }, {
	    key: '_addEventListeners',
	    value: function _addEventListeners() {
	      document.addEventListener('keyup', this._onKeyUp);
	      document.addEventListener('keydown', this._onKeyDown);
	      document.addEventListener('click', this._onClick);
	      document.addEventListener('touchmove', this._onTouchMove);
	      document.addEventListener('touchend', this._onTouchEnd);
	      document.addEventListener('mousedown', this._onMouseDown);
	      document.addEventListener('mouseover', this._onMouseOver);

	      if (this.isSelectOneElement) {
	        this.containerOuter.addEventListener('focus', this._onFocus);
	        this.containerOuter.addEventListener('blur', this._onBlur);
	      }

	      this.input.addEventListener('input', this._onInput);
	      this.input.addEventListener('paste', this._onPaste);
	      this.input.addEventListener('focus', this._onFocus);
	      this.input.addEventListener('blur', this._onBlur);
	    }

	    /**
	     * Remove event listeners
	     * @return
	     * @private
	     */

	  }, {
	    key: '_removeEventListeners',
	    value: function _removeEventListeners() {
	      document.removeEventListener('keyup', this._onKeyUp);
	      document.removeEventListener('keydown', this._onKeyDown);
	      document.removeEventListener('click', this._onClick);
	      document.removeEventListener('touchmove', this._onTouchMove);
	      document.removeEventListener('touchend', this._onTouchEnd);
	      document.removeEventListener('mousedown', this._onMouseDown);
	      document.removeEventListener('mouseover', this._onMouseOver);

	      if (this.isSelectOneElement) {
	        this.containerOuter.removeEventListener('focus', this._onFocus);
	        this.containerOuter.removeEventListener('blur', this._onBlur);
	      }

	      this.input.removeEventListener('input', this._onInput);
	      this.input.removeEventListener('paste', this._onPaste);
	      this.input.removeEventListener('focus', this._onFocus);
	      this.input.removeEventListener('blur', this._onBlur);
	    }

	    /**
	     * Set the correct input width based on placeholder
	     * value or input value
	     * @return
	     */

	  }, {
	    key: '_setInputWidth',
	    value: function _setInputWidth() {
	      if (this.placeholder) {
	        // If there is a placeholder, we only want to set the width of the input when it is a greater
	        // length than 75% of the placeholder. This stops the input jumping around.
	        if (this.input.value && this.input.value.length >= this.placeholder.length / 1.25) {
	          this.input.style.width = (0, _utils.getWidthOfInput)(this.input);
	        }
	      } else {
	        // If there is no placeholder, resize input to contents
	        this.input.style.width = (0, _utils.getWidthOfInput)(this.input);
	      }
	    }

	    /**
	     * Key down event
	     * @param  {Object} e Event
	     * @return
	     */

	  }, {
	    key: '_onKeyDown',
	    value: function _onKeyDown(e) {
	      var _this16 = this,
	          _keyDownActions;

	      if (e.target !== this.input && !this.containerOuter.contains(e.target)) {
	        return;
	      }

	      var target = e.target;
	      var activeItems = this.store.getItemsFilteredByActive();
	      var hasFocusedInput = this.input === document.activeElement;
	      var hasActiveDropdown = this.dropdown.classList.contains(this.config.classNames.activeState);
	      var hasItems = this.itemList && this.itemList.children;
	      var keyString = String.fromCharCode(e.keyCode);

	      var backKey = 46;
	      var deleteKey = 8;
	      var enterKey = 13;
	      var aKey = 65;
	      var escapeKey = 27;
	      var upKey = 38;
	      var downKey = 40;
	      var pageUpKey = 33;
	      var pageDownKey = 34;
	      var ctrlDownKey = e.ctrlKey || e.metaKey;

	      // If a user is typing and the dropdown is not active
	      if (!this.isTextElement && /[a-zA-Z0-9-_ ]/.test(keyString) && !hasActiveDropdown) {
	        this.showDropdown(true);
	      }

	      this.canSearch = this.config.searchEnabled;

	      var onAKey = function onAKey() {
	        // If CTRL + A or CMD + A have been pressed and there are items to select
	        if (ctrlDownKey && hasItems) {
	          _this16.canSearch = false;
	          if (_this16.config.removeItems && !_this16.input.value && _this16.input === document.activeElement) {
	            // Highlight items
	            _this16.highlightAll();
	          }
	        }
	      };

	      var onEnterKey = function onEnterKey() {
	        // If enter key is pressed and the input has a value
	        if (_this16.isTextElement && target.value) {
	          var value = _this16.input.value;
	          var canAddItem = _this16._canAddItem(activeItems, value);

	          // All is good, add
	          if (canAddItem.response) {
	            if (hasActiveDropdown) {
	              _this16.hideDropdown();
	            }
	            _this16._addItem(value);
	            _this16._triggerChange(value);
	            _this16.clearInput();
	          }
	        }

	        if (target.hasAttribute('data-button')) {
	          _this16._handleButtonAction(activeItems, target);
	          e.preventDefault();
	        }

	        if (hasActiveDropdown) {
	          e.preventDefault();
	          var highlighted = _this16.dropdown.querySelector('.' + _this16.config.classNames.highlightedState);

	          // If we have a highlighted choice
	          if (highlighted) {
	            // add enter keyCode value
	            if (activeItems[0]) {
	              activeItems[0].keyCode = enterKey;
	            }
	            _this16._handleChoiceAction(activeItems, highlighted);
	          }
	        } else if (_this16.isSelectOneElement) {
	          // Open single select dropdown if it's not active
	          if (!hasActiveDropdown) {
	            _this16.showDropdown(true);
	            e.preventDefault();
	          }
	        }
	      };

	      var onEscapeKey = function onEscapeKey() {
	        if (hasActiveDropdown) {
	          _this16.toggleDropdown();
	          _this16.containerOuter.focus();
	        }
	      };

	      var onDirectionKey = function onDirectionKey() {
	        // If up or down key is pressed, traverse through options
	        if (hasActiveDropdown || _this16.isSelectOneElement) {
	          // Show dropdown if focus
	          if (!hasActiveDropdown) {
	            _this16.showDropdown(true);
	          }

	          _this16.canSearch = false;

	          var directionInt = e.keyCode === downKey || e.keyCode === pageDownKey ? 1 : -1;
	          var skipKey = e.metaKey || e.keyCode === pageDownKey || e.keyCode === pageUpKey;

	          var nextEl = void 0;
	          if (skipKey) {
	            if (directionInt > 0) {
	              nextEl = Array.from(_this16.dropdown.querySelectorAll('[data-choice-selectable]')).pop();
	            } else {
	              nextEl = _this16.dropdown.querySelector('[data-choice-selectable]');
	            }
	          } else {
	            var currentEl = _this16.dropdown.querySelector('.' + _this16.config.classNames.highlightedState);
	            if (currentEl) {
	              nextEl = (0, _utils.getAdjacentEl)(currentEl, '[data-choice-selectable]', directionInt);
	            } else {
	              nextEl = _this16.dropdown.querySelector('[data-choice-selectable]');
	            }
	          }

	          if (nextEl) {
	            // We prevent default to stop the cursor moving
	            // when pressing the arrow
	            if (!(0, _utils.isScrolledIntoView)(nextEl, _this16.choiceList, directionInt)) {
	              _this16._scrollToChoice(nextEl, directionInt);
	            }
	            _this16._highlightChoice(nextEl);
	          }

	          // Prevent default to maintain cursor position whilst
	          // traversing dropdown options
	          e.preventDefault();
	        }
	      };

	      var onDeleteKey = function onDeleteKey() {
	        // If backspace or delete key is pressed and the input has no value
	        if (hasFocusedInput && !e.target.value && !_this16.isSelectOneElement) {
	          _this16._handleBackspace(activeItems);
	          e.preventDefault();
	        }
	      };

	      // Map keys to key actions
	      var keyDownActions = (_keyDownActions = {}, _defineProperty(_keyDownActions, aKey, onAKey), _defineProperty(_keyDownActions, enterKey, onEnterKey), _defineProperty(_keyDownActions, escapeKey, onEscapeKey), _defineProperty(_keyDownActions, upKey, onDirectionKey), _defineProperty(_keyDownActions, pageUpKey, onDirectionKey), _defineProperty(_keyDownActions, downKey, onDirectionKey), _defineProperty(_keyDownActions, pageDownKey, onDirectionKey), _defineProperty(_keyDownActions, deleteKey, onDeleteKey), _defineProperty(_keyDownActions, backKey, onDeleteKey), _keyDownActions);

	      // If keycode has a function, run it
	      if (keyDownActions[e.keyCode]) {
	        keyDownActions[e.keyCode]();
	      }
	    }

	    /**
	     * Key up event
	     * @param  {Object} e Event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onKeyUp',
	    value: function _onKeyUp(e) {
	      if (e.target !== this.input) {
	        return;
	      }

	      var value = this.input.value;
	      var activeItems = this.store.getItemsFilteredByActive();
	      var canAddItem = this._canAddItem(activeItems, value);

	      // We are typing into a text input and have a value, we want to show a dropdown
	      // notice. Otherwise hide the dropdown
	      if (this.isTextElement) {
	        var hasActiveDropdown = this.dropdown.classList.contains(this.config.classNames.activeState);
	        if (value) {

	          if (canAddItem.notice) {
	            var dropdownItem = this._getTemplate('notice', canAddItem.notice);
	            this.dropdown.innerHTML = dropdownItem.outerHTML;
	          }

	          if (canAddItem.response === true) {
	            if (!hasActiveDropdown) {
	              this.showDropdown();
	            }
	          } else if (!canAddItem.notice && hasActiveDropdown) {
	            this.hideDropdown();
	          }
	        } else if (hasActiveDropdown) {
	          this.hideDropdown();
	        }
	      } else {
	        var backKey = 46;
	        var deleteKey = 8;

	        // If user has removed value...
	        if ((e.keyCode === backKey || e.keyCode === deleteKey) && !e.target.value) {
	          // ...and it is a multiple select input, activate choices (if searching)
	          if (!this.isTextElement && this.isSearching) {
	            this.isSearching = false;
	            this.store.dispatch((0, _index3.activateChoices)(true));
	          }
	        } else if (this.canSearch && canAddItem.response) {
	          this._handleSearch(this.input.value);
	        }
	      }
	      // Re-establish canSearch value from changes in _onKeyDown
	      this.canSearch = this.config.searchEnabled;
	    }

	    /**
	     * Input event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onInput',
	    value: function _onInput() {
	      if (!this.isSelectOneElement) {
	        this._setInputWidth();
	      }
	    }

	    /**
	     * Touch move event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onTouchMove',
	    value: function _onTouchMove() {
	      if (this.wasTap === true) {
	        this.wasTap = false;
	      }
	    }

	    /**
	     * Touch end event
	     * @param  {Object} e Event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onTouchEnd',
	    value: function _onTouchEnd(e) {
	      var target = e.target || e.touches[0].target;
	      var hasActiveDropdown = this.dropdown.classList.contains(this.config.classNames.activeState);

	      // If a user tapped within our container...
	      if (this.wasTap === true && this.containerOuter.contains(target)) {
	        // ...and we aren't dealing with a single select box, show dropdown/focus input
	        if ((target === this.containerOuter || target === this.containerInner) && !this.isSelectOneElement) {
	          if (this.isTextElement) {
	            // If text element, we only want to focus the input (if it isn't already)
	            if (document.activeElement !== this.input) {
	              this.input.focus();
	            }
	          } else {
	            if (!hasActiveDropdown) {
	              // If a select box, we want to show the dropdown
	              this.showDropdown(true);
	            }
	          }
	        }
	        // Prevents focus event firing
	        e.stopPropagation();
	      }

	      this.wasTap = true;
	    }

	    /**
	     * Mouse down event
	     * @param  {Object} e Event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onMouseDown',
	    value: function _onMouseDown(e) {
	      var target = e.target;

	      // If we have our mouse down on the scrollbar and are on IE11...
	      if (target === this.choiceList && this.isIe11) {
	        this.isScrollingOnIe = true;
	      }

	      if (this.containerOuter.contains(target) && target !== this.input) {
	        var foundTarget = void 0;
	        var activeItems = this.store.getItemsFilteredByActive();
	        var hasShiftKey = e.shiftKey;

	        if (foundTarget = (0, _utils.findAncestorByAttrName)(target, 'data-button')) {
	          this._handleButtonAction(activeItems, foundTarget);
	        } else if (foundTarget = (0, _utils.findAncestorByAttrName)(target, 'data-item')) {
	          this._handleItemAction(activeItems, foundTarget, hasShiftKey);
	        } else if (foundTarget = (0, _utils.findAncestorByAttrName)(target, 'data-choice')) {
	          this._handleChoiceAction(activeItems, foundTarget);
	        }

	        e.preventDefault();
	      }
	    }

	    /**
	     * Click event
	     * @param  {Object} e Event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onClick',
	    value: function _onClick(e) {
	      var target = e.target;
	      var hasActiveDropdown = this.dropdown.classList.contains(this.config.classNames.activeState);
	      var activeItems = this.store.getItemsFilteredByActive();

	      // If target is something that concerns us
	      if (this.containerOuter.contains(target)) {
	        // Handle button delete
	        if (target.hasAttribute('data-button')) {
	          this._handleButtonAction(activeItems, target);
	        }

	        if (!hasActiveDropdown) {
	          if (this.isTextElement) {
	            if (document.activeElement !== this.input) {
	              this.input.focus();
	            }
	          } else {
	            if (this.canSearch) {
	              this.showDropdown(true);
	            } else {
	              this.showDropdown();
	              this.containerOuter.focus();
	            }
	          }
	        } else if (this.isSelectOneElement && target !== this.input && !this.dropdown.contains(target)) {
	          this.hideDropdown(true);
	        }
	      } else {
	        var hasHighlightedItems = activeItems.some(function (item) {
	          return item.highlighted;
	        });

	        // De-select any highlighted items
	        if (hasHighlightedItems) {
	          this.unhighlightAll();
	        }

	        // Remove focus state
	        this.containerOuter.classList.remove(this.config.classNames.focusState);

	        // Close all other dropdowns
	        if (hasActiveDropdown) {
	          this.hideDropdown();
	        }
	      }
	    }

	    /**
	     * Mouse over (hover) event
	     * @param  {Object} e Event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onMouseOver',
	    value: function _onMouseOver(e) {
	      // If the dropdown is either the target or one of its children is the target
	      if (e.target === this.dropdown || this.dropdown.contains(e.target)) {
	        if (e.target.hasAttribute('data-choice')) this._highlightChoice(e.target);
	      }
	    }

	    /**
	     * Paste event
	     * @param  {Object} e Event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onPaste',
	    value: function _onPaste(e) {
	      // Disable pasting into the input if option has been set
	      if (e.target === this.input && !this.config.paste) {
	        e.preventDefault();
	      }
	    }

	    /**
	     * Focus event
	     * @param  {Object} e Event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onFocus',
	    value: function _onFocus(e) {
	      var _this17 = this;

	      var target = e.target;
	      // If target is something that concerns us
	      if (this.containerOuter.contains(target)) {
	        var hasActiveDropdown = this.dropdown.classList.contains(this.config.classNames.activeState);
	        var focusActions = {
	          text: function text() {
	            if (target === _this17.input) {
	              _this17.containerOuter.classList.add(_this17.config.classNames.focusState);
	            }
	          },
	          'select-one': function selectOne() {
	            _this17.containerOuter.classList.add(_this17.config.classNames.focusState);
	            if (target === _this17.input) {
	              // Show dropdown if it isn't already showing
	              if (!hasActiveDropdown) {
	                _this17.showDropdown();
	              }
	            }
	          },
	          'select-multiple': function selectMultiple() {
	            if (target === _this17.input) {
	              // If element is a select box, the focused element is the container and the dropdown
	              // isn't already open, focus and show dropdown
	              _this17.containerOuter.classList.add(_this17.config.classNames.focusState);

	              if (!hasActiveDropdown) {
	                _this17.showDropdown(true);
	              }
	            }
	          }
	        };

	        focusActions[this.passedElement.type]();
	      }
	    }

	    /**
	     * Blur event
	     * @param  {Object} e Event
	     * @return
	     * @private
	     */

	  }, {
	    key: '_onBlur',
	    value: function _onBlur(e) {
	      var _this18 = this;

	      var target = e.target;
	      // If target is something that concerns us
	      if (this.containerOuter.contains(target) && !this.isScrollingOnIe) {
	        var activeItems = this.store.getItemsFilteredByActive();
	        var hasActiveDropdown = this.dropdown.classList.contains(this.config.classNames.activeState);
	        var hasHighlightedItems = activeItems.some(function (item) {
	          return item.highlighted;
	        });
	        var blurActions = {
	          text: function text() {
	            if (target === _this18.input) {
	              // Remove the focus state
	              _this18.containerOuter.classList.remove(_this18.config.classNames.focusState);
	              // De-select any highlighted items
	              if (hasHighlightedItems) {
	                _this18.unhighlightAll();
	              }
	              // Hide dropdown if it is showing
	              if (hasActiveDropdown) {
	                _this18.hideDropdown();
	              }
	            }
	          },
	          'select-one': function selectOne() {
	            _this18.containerOuter.classList.remove(_this18.config.classNames.focusState);
	            if (target === _this18.containerOuter) {
	              // Hide dropdown if it is showing
	              if (hasActiveDropdown && !_this18.canSearch) {
	                _this18.hideDropdown();
	              }
	            }
	            if (target === _this18.input && hasActiveDropdown) {
	              // Hide dropdown if it is showing
	              _this18.hideDropdown();
	            }
	          },
	          'select-multiple': function selectMultiple() {
	            if (target === _this18.input) {
	              // Remove the focus state
	              _this18.containerOuter.classList.remove(_this18.config.classNames.focusState);
	              // Hide dropdown if it is showing
	              if (hasActiveDropdown) {
	                _this18.hideDropdown();
	              }
	              // De-select any highlighted items
	              if (hasHighlightedItems) {
	                _this18.unhighlightAll();
	              }
	            }
	          }
	        };

	        blurActions[this.passedElement.type]();
	      } else {
	        // On IE11, clicking the scollbar blurs our input and thus
	        // closes the dropdown. To stop this, we refocus our input
	        // if we know we are on IE *and* are scrolling.
	        this.isScrollingOnIe = false;
	        this.input.focus();
	      }
	    }

	    /**
	     * Tests value against a regular expression
	     * @param  {string} value   Value to test
	     * @return {Boolean}        Whether test passed/failed
	     * @private
	     */

	  }, {
	    key: '_regexFilter',
	    value: function _regexFilter(value) {
	      if (!value) {
	        return false;
	      }

	      var regex = this.config.regexFilter;
	      var expression = new RegExp(regex.source, 'i');
	      return expression.test(value);
	    }

	    /**
	     * Scroll to an option element
	     * @param  {HTMLElement} choice  Option to scroll to
	     * @param  {Number} direction  Whether option is above or below
	     * @return
	     * @private
	     */

	  }, {
	    key: '_scrollToChoice',
	    value: function _scrollToChoice(choice, direction) {
	      var _this19 = this;

	      if (!choice) {
	        return;
	      }

	      var dropdownHeight = this.choiceList.offsetHeight;
	      var choiceHeight = choice.offsetHeight;
	      // Distance from bottom of element to top of parent
	      var choicePos = choice.offsetTop + choiceHeight;
	      // Scroll position of dropdown
	      var containerScrollPos = this.choiceList.scrollTop + dropdownHeight;
	      // Difference between the choice and scroll position
	      var endPoint = direction > 0 ? this.choiceList.scrollTop + choicePos - containerScrollPos : choice.offsetTop;

	      var animateScroll = function animateScroll() {
	        var strength = 4;
	        var choiceListScrollTop = _this19.choiceList.scrollTop;
	        var continueAnimation = false;
	        var easing = void 0;
	        var distance = void 0;

	        if (direction > 0) {
	          easing = (endPoint - choiceListScrollTop) / strength;
	          distance = easing > 1 ? easing : 1;

	          _this19.choiceList.scrollTop = choiceListScrollTop + distance;
	          if (choiceListScrollTop < endPoint) {
	            continueAnimation = true;
	          }
	        } else {
	          easing = (choiceListScrollTop - endPoint) / strength;
	          distance = easing > 1 ? easing : 1;

	          _this19.choiceList.scrollTop = choiceListScrollTop - distance;
	          if (choiceListScrollTop > endPoint) {
	            continueAnimation = true;
	          }
	        }

	        if (continueAnimation) {
	          requestAnimationFrame(function (time) {
	            animateScroll(time, endPoint, direction);
	          });
	        }
	      };

	      requestAnimationFrame(function (time) {
	        animateScroll(time, endPoint, direction);
	      });
	    }

	    /**
	     * Highlight choice
	     * @param  {HTMLElement} [el] Element to highlight
	     * @return
	     * @private
	     */

	  }, {
	    key: '_highlightChoice',
	    value: function _highlightChoice() {
	      var _this20 = this;

	      var el = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;

	      // Highlight first element in dropdown
	      var choices = Array.from(this.dropdown.querySelectorAll('[data-choice-selectable]'));
	      var passedEl = el;

	      if (choices && choices.length) {
	        var highlightedChoices = Array.from(this.dropdown.querySelectorAll('.' + this.config.classNames.highlightedState));

	        // Remove any highlighted choices
	        highlightedChoices.forEach(function (choice) {
	          choice.classList.remove(_this20.config.classNames.highlightedState);
	          choice.setAttribute('aria-selected', 'false');
	        });

	        if (passedEl) {
	          this.highlightPosition = choices.indexOf(passedEl);
	        } else {
	          // Highlight choice based on last known highlight location
	          if (choices.length > this.highlightPosition) {
	            // If we have an option to highlight
	            passedEl = choices[this.highlightPosition];
	          } else {
	            // Otherwise highlight the option before
	            passedEl = choices[choices.length - 1];
	          }

	          if (!passedEl) {
	            passedEl = choices[0];
	          }
	        }

	        // Highlight given option, and set accessiblity attributes
	        passedEl.classList.add(this.config.classNames.highlightedState);
	        passedEl.setAttribute('aria-selected', 'true');
	        this.containerOuter.setAttribute('aria-activedescendant', passedEl.id);
	      }
	    }

	    /**
	     * Add item to store with correct value
	     * @param {String} value Value to add to store
	     * @param {String} [label] Label to add to store
	     * @param {Number} [choiceId=-1] ID of the associated choice that was selected
	     * @param {Number} [groupId=-1] ID of group choice is within. Negative number indicates no group
	     * @param {Object} [customProperties] Object containing user defined properties
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: '_addItem',
	    value: function _addItem(value) {
	      var label = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      var choiceId = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : -1;
	      var groupId = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -1;
	      var customProperties = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : null;
	      var placeholder = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : false;
	      var keyCode = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : null;

	      var passedValue = (0, _utils.isType)('String', value) ? value.trim() : value;
	      var passedKeyCode = keyCode;
	      var items = this.store.getItems();
	      var passedLabel = label || passedValue;
	      var passedOptionId = parseInt(choiceId, 10) || -1;

	      // Get group if group ID passed
	      var group = groupId >= 0 ? this.store.getGroupById(groupId) : null;

	      // Generate unique id
	      var id = items ? items.length + 1 : 1;

	      // If a prepended value has been passed, prepend it
	      if (this.config.prependValue) {
	        passedValue = this.config.prependValue + passedValue.toString();
	      }

	      // If an appended value has been passed, append it
	      if (this.config.appendValue) {
	        passedValue += this.config.appendValue.toString();
	      }

	      this.store.dispatch((0, _index3.addItem)(passedValue, passedLabel, id, passedOptionId, groupId, customProperties, placeholder, passedKeyCode));

	      if (this.isSelectOneElement) {
	        this.removeActiveItems(id);
	      }

	      // Trigger change event
	      if (group && group.value) {
	        (0, _utils.triggerEvent)(this.passedElement, 'addItem', {
	          id: id,
	          value: passedValue,
	          label: passedLabel,
	          groupValue: group.value,
	          keyCode: passedKeyCode
	        });
	      } else {
	        (0, _utils.triggerEvent)(this.passedElement, 'addItem', {
	          id: id,
	          value: passedValue,
	          label: passedLabel,
	          keyCode: passedKeyCode
	        });
	      }

	      return this;
	    }

	    /**
	     * Remove item from store
	     * @param {Object} item Item to remove
	     * @return {Object} Class instance
	     * @public
	     */

	  }, {
	    key: '_removeItem',
	    value: function _removeItem(item) {
	      if (!item || !(0, _utils.isType)('Object', item)) {
	        return this;
	      }

	      var id = item.id;
	      var value = item.value;
	      var label = item.label;
	      var choiceId = item.choiceId;
	      var groupId = item.groupId;
	      var group = groupId >= 0 ? this.store.getGroupById(groupId) : null;

	      this.store.dispatch((0, _index3.removeItem)(id, choiceId));

	      if (group && group.value) {
	        (0, _utils.triggerEvent)(this.passedElement, 'removeItem', {
	          id: id,
	          value: value,
	          label: label,
	          groupValue: group.value
	        });
	      } else {
	        (0, _utils.triggerEvent)(this.passedElement, 'removeItem', {
	          id: id,
	          value: value,
	          label: label
	        });
	      }

	      return this;
	    }

	    /**
	     * Add choice to dropdown
	     * @param {String} value Value of choice
	     * @param {String} [label] Label of choice
	     * @param {Boolean} [isSelected=false] Whether choice is selected
	     * @param {Boolean} [isDisabled=false] Whether choice is disabled
	     * @param {Number} [groupId=-1] ID of group choice is within. Negative number indicates no group
	     * @param {Object} [customProperties] Object containing user defined properties
	     * @return
	     * @private
	     */

	  }, {
	    key: '_addChoice',
	    value: function _addChoice(value) {
	      var label = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
	      var isSelected = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;
	      var isDisabled = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : false;
	      var groupId = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : -1;
	      var customProperties = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : null;
	      var placeholder = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : false;
	      var keyCode = arguments.length > 7 && arguments[7] !== undefined ? arguments[7] : null;

	      if (typeof value === 'undefined' || value === null) {
	        return;
	      }

	      // Generate unique id
	      var choices = this.store.getChoices();
	      var choiceLabel = label || value;
	      var choiceId = choices ? choices.length + 1 : 1;
	      var choiceElementId = this.baseId + '-' + this.idNames.itemChoice + '-' + choiceId;

	      this.store.dispatch((0, _index3.addChoice)(value, choiceLabel, choiceId, groupId, isDisabled, choiceElementId, customProperties, placeholder, keyCode));

	      if (isSelected) {
	        this._addItem(value, choiceLabel, choiceId, undefined, customProperties, placeholder, keyCode);
	      }
	    }

	    /**
	     * Clear all choices added to the store.
	     * @return
	     * @private
	     */

	  }, {
	    key: '_clearChoices',
	    value: function _clearChoices() {
	      this.store.dispatch((0, _index3.clearChoices)());
	    }

	    /**
	     * Add group to dropdown
	     * @param {Object} group Group to add
	     * @param {Number} id Group ID
	     * @param {String} [valueKey] name of the value property on the object
	     * @param {String} [labelKey] name of the label property on the object
	     * @return
	     * @private
	     */

	  }, {
	    key: '_addGroup',
	    value: function _addGroup(group, id) {
	      var _this21 = this;

	      var valueKey = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 'value';
	      var labelKey = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 'label';

	      var groupChoices = (0, _utils.isType)('Object', group) ? group.choices : Array.from(group.getElementsByTagName('OPTION'));
	      var groupId = id ? id : Math.floor(new Date().valueOf() * Math.random());
	      var isDisabled = group.disabled ? group.disabled : false;

	      if (groupChoices) {
	        this.store.dispatch((0, _index3.addGroup)(group.label, groupId, true, isDisabled));

	        groupChoices.forEach(function (option) {
	          var isOptDisabled = option.disabled || option.parentNode && option.parentNode.disabled;
	          _this21._addChoice(option[valueKey], (0, _utils.isType)('Object', option) ? option[labelKey] : option.innerHTML, option.selected, isOptDisabled, groupId, option.customProperties, option.placeholder);
	        });
	      } else {
	        this.store.dispatch((0, _index3.addGroup)(group.label, group.id, false, group.disabled));
	      }
	    }

	    /**
	     * Get template from name
	     * @param  {String}    template Name of template to get
	     * @param  {...}       args     Data to pass to template
	     * @return {HTMLElement}        Template
	     * @private
	     */

	  }, {
	    key: '_getTemplate',
	    value: function _getTemplate(template) {
	      if (!template) {
	        return null;
	      }
	      var templates = this.config.templates;

	      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        args[_key - 1] = arguments[_key];
	      }

	      return templates[template].apply(templates, args);
	    }

	    /**
	     * Create HTML element based on type and arguments
	     * @return
	     * @private
	     */

	  }, {
	    key: '_createTemplates',
	    value: function _createTemplates() {
	      var _this22 = this;

	      var globalClasses = this.config.classNames;
	      var templates = {
	        containerOuter: function containerOuter(direction) {
	          return (0, _utils.strToEl)('\n          <div\n            class="' + globalClasses.containerOuter + '"\n            ' + (_this22.isSelectElement ? _this22.config.searchEnabled ? 'role="combobox" aria-autocomplete="list"' : 'role="listbox"' : '') + '\n            data-type="' + _this22.passedElement.type + '"\n            ' + (_this22.isSelectOneElement ? 'tabindex="0"' : '') + '\n            aria-haspopup="true"\n            aria-expanded="false"\n            dir="' + direction + '"\n            >\n          </div>\n        ');
	        },
	        containerInner: function containerInner() {
	          return (0, _utils.strToEl)('\n          <div class="' + globalClasses.containerInner + '"></div>\n        ');
	        },
	        itemList: function itemList() {
	          var _classNames;

	          var localClasses = (0, _classnames2.default)(globalClasses.list, (_classNames = {}, _defineProperty(_classNames, globalClasses.listSingle, _this22.isSelectOneElement), _defineProperty(_classNames, globalClasses.listItems, !_this22.isSelectOneElement), _classNames));

	          return (0, _utils.strToEl)('\n          <div class="' + localClasses + '"></div>\n        ');
	        },
	        placeholder: function placeholder(value) {
	          return (0, _utils.strToEl)('\n          <div class="' + globalClasses.placeholder + '">\n            ' + value + '\n          </div>\n        ');
	        },
	        item: function item(data) {
	          var _classNames2;

	          var localClasses = (0, _classnames2.default)(globalClasses.item, (_classNames2 = {}, _defineProperty(_classNames2, globalClasses.highlightedState, data.highlighted), _defineProperty(_classNames2, globalClasses.itemSelectable, !data.highlighted), _defineProperty(_classNames2, globalClasses.placeholder, data.placeholder), _classNames2));

	          if (_this22.config.removeItemButton) {
	            var _classNames3;

	            localClasses = (0, _classnames2.default)(globalClasses.item, (_classNames3 = {}, _defineProperty(_classNames3, globalClasses.highlightedState, data.highlighted), _defineProperty(_classNames3, globalClasses.itemSelectable, !data.disabled), _defineProperty(_classNames3, globalClasses.placeholder, data.placeholder), _classNames3));

	            return (0, _utils.strToEl)('\n            <div\n              class="' + localClasses + '"\n              data-item\n              data-id="' + data.id + '"\n              data-value="' + data.value + '"\n              data-deletable\n              ' + (data.active ? 'aria-selected="true"' : '') + '\n              ' + (data.disabled ? 'aria-disabled="true"' : '') + '\n              >\n              ' + data.label + '<!--\n           --><button\n                type="button"\n                class="' + globalClasses.button + '"\n                data-button\n                aria-label="Remove item: \'' + data.value + '\'"\n                >\n                Remove item\n              </button>\n            </div>\n          ');
	          }

	          return (0, _utils.strToEl)('\n          <div\n            class="' + localClasses + '"\n            data-item\n            data-id="' + data.id + '"\n            data-value="' + data.value + '"\n            ' + (data.active ? 'aria-selected="true"' : '') + '\n            ' + (data.disabled ? 'aria-disabled="true"' : '') + '\n            >\n            ' + data.label + '\n          </div>\n        ');
	        },
	        choiceList: function choiceList() {
	          return (0, _utils.strToEl)('\n          <div\n            class="' + globalClasses.list + '"\n            dir="ltr"\n            role="listbox"\n            ' + (!_this22.isSelectOneElement ? 'aria-multiselectable="true"' : '') + '\n            >\n          </div>\n        ');
	        },
	        choiceGroup: function choiceGroup(data) {
	          var localClasses = (0, _classnames2.default)(globalClasses.group, _defineProperty({}, globalClasses.itemDisabled, data.disabled));

	          return (0, _utils.strToEl)('\n          <div\n            class="' + localClasses + '"\n            data-group\n            data-id="' + data.id + '"\n            data-value="' + data.value + '"\n            role="group"\n            ' + (data.disabled ? 'aria-disabled="true"' : '') + '\n            >\n            <div class="' + globalClasses.groupHeading + '">' + data.value + '</div>\n          </div>\n        ');
	        },
	        choice: function choice(data) {
	          var _classNames5;

	          var localClasses = (0, _classnames2.default)(globalClasses.item, globalClasses.itemChoice, (_classNames5 = {}, _defineProperty(_classNames5, globalClasses.itemDisabled, data.disabled), _defineProperty(_classNames5, globalClasses.itemSelectable, !data.disabled), _defineProperty(_classNames5, globalClasses.placeholder, data.placeholder), _classNames5));

	          return (0, _utils.strToEl)('\n          <div\n            class="' + localClasses + '"\n            data-select-text="' + _this22.config.itemSelectText + '"\n            data-choice\n            data-id="' + data.id + '"\n            data-value="' + data.value + '"\n            ' + (data.disabled ? 'data-choice-disabled aria-disabled="true"' : 'data-choice-selectable') + '\n            id="' + data.elementId + '"\n            ' + (data.groupId > 0 ? 'role="treeitem"' : 'role="option"') + '\n            >\n            ' + data.label + '\n          </div>\n        ');
	        },
	        input: function input() {
	          var localClasses = (0, _classnames2.default)(globalClasses.input, globalClasses.inputCloned);

	          return (0, _utils.strToEl)('\n          <input\n            type="text"\n            class="' + localClasses + '"\n            autocomplete="off"\n            autocapitalize="off"\n            spellcheck="false"\n            role="textbox"\n            aria-autocomplete="list"\n            >\n        ');
	        },
	        dropdown: function dropdown() {
	          var localClasses = (0, _classnames2.default)(globalClasses.list, globalClasses.listDropdown);

	          return (0, _utils.strToEl)('\n          <div\n            class="' + localClasses + '"\n            aria-expanded="false"\n            >\n          </div>\n        ');
	        },
	        notice: function notice(label) {
	          var _classNames6;

	          var type = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '';

	          var localClasses = (0, _classnames2.default)(globalClasses.item, globalClasses.itemChoice, (_classNames6 = {}, _defineProperty(_classNames6, globalClasses.noResults, type === 'no-results'), _defineProperty(_classNames6, globalClasses.noChoices, type === 'no-choices'), _classNames6));

	          return (0, _utils.strToEl)('\n          <div class="' + localClasses + '">\n            ' + label + '\n          </div>\n        ');
	        },
	        option: function option(data) {
	          return (0, _utils.strToEl)('\n          <option value="' + data.value + '" selected>' + data.label + '</option>\n        ');
	        }
	      };

	      // User's custom templates
	      var callbackTemplate = this.config.callbackOnCreateTemplates;
	      var userTemplates = {};
	      if (callbackTemplate && (0, _utils.isType)('Function', callbackTemplate)) {
	        userTemplates = callbackTemplate.call(this, _utils.strToEl);
	      }

	      this.config.templates = (0, _utils.extend)(templates, userTemplates);
	    }
	  }, {
	    key: '_setLoading',
	    value: function _setLoading(isLoading) {
	      this.store.dispatch((0, _index3.setIsLoading)(isLoading));
	    }

	    /**
	     * Create DOM structure around passed select element
	     * @return
	     * @private
	     */

	  }, {
	    key: '_createInput',
	    value: function _createInput() {
	      var _this23 = this;

	      var direction = this.passedElement.getAttribute('dir') || 'ltr';
	      var containerOuter = this._getTemplate('containerOuter', direction);
	      var containerInner = this._getTemplate('containerInner');
	      var itemList = this._getTemplate('itemList');
	      var choiceList = this._getTemplate('choiceList');
	      var input = this._getTemplate('input');
	      var dropdown = this._getTemplate('dropdown');

	      this.containerOuter = containerOuter;
	      this.containerInner = containerInner;
	      this.input = input;
	      this.choiceList = choiceList;
	      this.itemList = itemList;
	      this.dropdown = dropdown;

	      // Hide passed input
	      this.passedElement.classList.add(this.config.classNames.input, this.config.classNames.hiddenState);

	      // Remove element from tab index
	      this.passedElement.tabIndex = '-1';

	      // Backup original styles if any
	      var origStyle = this.passedElement.getAttribute('style');

	      if (Boolean(origStyle)) {
	        this.passedElement.setAttribute('data-choice-orig-style', origStyle);
	      }

	      this.passedElement.setAttribute('style', 'display:none;');
	      this.passedElement.setAttribute('aria-hidden', 'true');
	      this.passedElement.setAttribute('data-choice', 'active');

	      // Wrap input in container preserving DOM ordering
	      (0, _utils.wrap)(this.passedElement, containerInner);

	      // Wrapper inner container with outer container
	      (0, _utils.wrap)(containerInner, containerOuter);

	      if (this.isSelectOneElement) {
	        input.placeholder = this.config.searchPlaceholderValue || '';
	      } else if (this.placeholder) {
	        input.placeholder = this.placeholder;
	        input.style.width = (0, _utils.getWidthOfInput)(input);
	      }

	      if (!this.config.addItems) {
	        this.disable();
	      }

	      containerOuter.appendChild(containerInner);
	      containerOuter.appendChild(dropdown);
	      containerInner.appendChild(itemList);

	      if (!this.isTextElement) {
	        dropdown.appendChild(choiceList);
	      }

	      if (this.isSelectMultipleElement || this.isTextElement) {
	        containerInner.appendChild(input);
	      } else if (this.canSearch) {
	        dropdown.insertBefore(input, dropdown.firstChild);
	      }

	      if (this.isSelectElement) {
	        var passedGroups = Array.from(this.passedElement.getElementsByTagName('OPTGROUP'));

	        this.highlightPosition = 0;
	        this.isSearching = false;

	        this._setLoading(true);

	        if (passedGroups && passedGroups.length) {
	          passedGroups.forEach(function (group) {
	            _this23._addGroup(group, group.id || null);
	          });
	        } else {
	          var passedOptions = Array.from(this.passedElement.options);
	          var filter = this.config.sortFilter;
	          var allChoices = this.presetChoices;

	          // Create array of options from option elements
	          passedOptions.forEach(function (o) {
	            allChoices.push({
	              value: o.value,
	              label: o.innerHTML,
	              selected: o.selected,
	              disabled: o.disabled || o.parentNode.disabled,
	              placeholder: o.hasAttribute('placeholder')
	            });
	          });

	          // If sorting is enabled or the user is searching, filter choices
	          if (this.config.shouldSort) {
	            allChoices.sort(filter);
	          }

	          // Determine whether there is a selected choice
	          var hasSelectedChoice = allChoices.some(function (choice) {
	            return choice.selected;
	          });

	          // Add each choice
	          allChoices.forEach(function (choice, index) {
	            // Pre-select first choice if it's a single select
	            if (_this23.isSelectOneElement) {
	              // If there is a selected choice already or the choice is not
	              // the first in the array, add each choice normally
	              // Otherwise pre-select the first choice in the array
	              var shouldPreselect = hasSelectedChoice || !hasSelectedChoice && index > 0;
	              _this23._addChoice(choice.value, choice.label, shouldPreselect ? choice.selected : true, shouldPreselect ? choice.disabled : false, undefined, choice.customProperties, choice.placeholder);
	            } else {
	              _this23._addChoice(choice.value, choice.label, choice.selected, choice.disabled, undefined, choice.customProperties, choice.placeholder);
	            }
	          });
	        }

	        this._setLoading(false);
	      } else if (this.isTextElement) {
	        // Add any preset values seperated by delimiter
	        this.presetItems.forEach(function (item) {
	          var itemType = (0, _utils.getType)(item);
	          if (itemType === 'Object') {
	            if (!item.value) {
	              return;
	            }
	            _this23._addItem(item.value, item.label, item.id, undefined, item.customProperties, item.placeholder);
	          } else if (itemType === 'String') {
	            _this23._addItem(item);
	          }
	        });
	      }
	    }

	    /*=====  End of Private functions  ======*/

	  }]);

	  return Choices;
	}();

		module.exports = Choices;

/***/ }),
