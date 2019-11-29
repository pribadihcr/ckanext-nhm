window.slug_search = window.slug_search || (function () {
    let self = {};

    /**
     * Given a query and some resource ids to search on, requests a slug for it and redirects to it.
     *
     * @param query the query object
     * @param resourceIds a list of resource ids
     */
    self.doSearch = function (query, resourceIds) {
        const payload = {};
        if (!!query) {
            payload.query = query;
        }
        payload.resource_ids = resourceIds;

        fetch('/api/3/action/datastore_create_slug', {
            method: 'POST',
            body: JSON.stringify(payload),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(function (response) {
            return response.json();
        }).then(function (json) {
            window.location.href = '/search/' + json.result.slug;
        });
    };

    /**
     * Binds up listeners on the main search bar so that it does things when you click search.
     */
    self.bindMainSearch = function () {
        const mainSearch = $('#main_search');
        const submitButton = mainSearch.find('button');

        submitButton.on('click', function () {
            const query = {};
            const searchValue = $('#q').val();
            if (!!searchValue) {
                query.search = searchValue;
            }

            const resourceIds = [];
            const selection = $('.search-tab.selected').attr('id');
            if (selection === 'scope-collections') {
                resourceIds.push(
                    // TODO: these need to come from the config
                    'ec61d82a-748d-4b53-8e99-3e708e76bc4d',
                    '05ff2255-c38a-40c9-b657-4ccb55ab2feb',
                    'bb909597-dedf-427d-8c04-4c02b3a24db3'
                );
            }

            self.doSearch(query, resourceIds);
        });
    };

    /**
     * Binds click listeners onto the scope selection tabs so that when they are clicked, the
     * selection is changed.
     */
    self.bindScopeSelection = function () {
        const searchTabs = $('.search-tabs').find('.search-tab');
        searchTabs.each(function () {
            const element = $(this);
            element.on('click', function () {
                searchTabs.removeClass('selected');
                element.addClass('selected');
            })
        });
    };

    /**
     * Binds click listeners to the collection blocks so that when they're clicked they request a
     * slug and then redirect to it.
     */
    self.bindCollectionCodes = function () {
        $('.collection-block').each(function() {
            const collectionCode = $(this).attr('data-collection-code');

            $(this).on('click', function() {
                const query = {
                    filters: {
                        and: [
                            {
                                string_equals: {
                                    fields: [
                                        'collectionCode'
                                    ],
                                    value: collectionCode
                                }
                            }
                        ]
                    }
                };
                self.doSearch(query, ['05ff2255-c38a-40c9-b657-4ccb55ab2feb'])
            });
        });
    };

    return self;
}());


// bind up as soon as the document is ready for it
$(document).ready(function () {
    window.slug_search.bindScopeSelection();
    window.slug_search.bindMainSearch();
    window.slug_search.bindCollectionCodes();
});
