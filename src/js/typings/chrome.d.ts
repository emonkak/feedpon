/**
 * The chrome.events namespace contains common types used by APIs dispatching events to notify you when something interesting happens.
 * Availability: Since Chrome 21.
 */
declare module chrome.events {
    /** Filters URLs for various criteria. See event filtering. All criteria are case sensitive. */
    interface UrlFilter {
        /** Optional. Matches if the scheme of the URL is equal to any of the schemes specified in the array.  */
        schemes?: string[];
        /**
         * Optional.
          * Since Chrome 23.
         * Matches if the URL (without fragment identifier) matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.
         */
        urlMatches?: string;
        /** Optional. Matches if the path segment of the URL contains a specified string.  */
        pathContains?: string;
        /** Optional. Matches if the host name of the URL ends with a specified string.  */
        hostSuffix?: string;
        /** Optional. Matches if the host name of the URL starts with a specified string.  */
        hostPrefix?: string;
        /** Optional. Matches if the host name of the URL contains a specified string. To test whether a host name component has a prefix 'foo', use hostContains: '.foo'. This matches 'www.foobar.com' and 'foo.com', because an implicit dot is added at the beginning of the host name. Similarly, hostContains can be used to match against component suffix ('foo.') and to exactly match against components ('.foo.'). Suffix- and exact-matching for the last components need to be done separately using hostSuffix, because no implicit dot is added at the end of the host name.  */
        hostContains?: string;
        /** Optional. Matches if the URL (without fragment identifier) contains a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlContains?: string;
        /** Optional. Matches if the query segment of the URL ends with a specified string.  */
        querySuffix?: string;
        /** Optional. Matches if the URL (without fragment identifier) starts with a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlPrefix?: string;
        /** Optional. Matches if the host name of the URL is equal to a specified string.  */
        hostEquals?: string;
        /** Optional. Matches if the URL (without fragment identifier) is equal to a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlEquals?: string;
        /** Optional. Matches if the query segment of the URL contains a specified string.  */
        queryContains?: string;
        /** Optional. Matches if the path segment of the URL starts with a specified string.  */
        pathPrefix?: string;
        /** Optional. Matches if the path segment of the URL is equal to a specified string.  */
        pathEquals?: string;
        /** Optional. Matches if the path segment of the URL ends with a specified string.  */
        pathSuffix?: string;
        /** Optional. Matches if the query segment of the URL is equal to a specified string.  */
        queryEquals?: string;
        /** Optional. Matches if the query segment of the URL starts with a specified string.  */
        queryPrefix?: string;
        /** Optional. Matches if the URL (without fragment identifier) ends with a specified string. Port numbers are stripped from the URL if they match the default port number.  */
        urlSuffix?: string;
        /** Optional. Matches if the port of the URL is contained in any of the specified port lists. For example [80, 443, [1000, 1200]] matches all requests on port 80, 443 and in the range 1000-1200.  */
        ports?: any[];
        /**
         * Optional.
          * Since Chrome 28.
         * Matches if the URL without query segment and fragment identifier matches a specified regular expression. Port numbers are stripped from the URL if they match the default port number. The regular expressions use the RE2 syntax.
         */
        originAndPathMatches?: string;
    }

    /** An object which allows the addition and removal of listeners for a Chrome event. */
    interface Event {
        /**
         * Registers an event listener callback to an event.
         * @param callback Called when an event occurs. The parameters of this function depend on the type of event.
         * The callback parameter should be a function that looks like this:
         * function() {...};
         */
        addListener(callback: Function): void;
        /**
         * Returns currently registered rules.
         * @param callback Called with registered rules.
         * The callback parameter should be a function that looks like this:
         * function(array of Rule rules) {...};
         * Parameter rules: Rules that were registered, the optional parameters are filled with values.
         */
        getRules(callback: (rules: Rule[]) => void): void;
        /**
         * Returns currently registered rules.
         * @param ruleIdentifiers If an array is passed, only rules with identifiers contained in this array are returned.
         * @param callback Called with registered rules.
         * The callback parameter should be a function that looks like this:
         * function(array of Rule rules) {...};
         * Parameter rules: Rules that were registered, the optional parameters are filled with values.
         */
        getRules(ruleIdentifiers: string[], callback: (rules: Rule[]) => void): void;
        /**
         * @param callback Listener whose registration status shall be tested.
         */
        hasListener(callback: Function): boolean;
        /**
         * Unregisters currently registered rules.
         * @param ruleIdentifiers If an array is passed, only rules with identifiers contained in this array are unregistered.
         * @param callback Called when rules were unregistered.
         * If you specify the callback parameter, it should be a function that looks like this:
         * function() {...};
         */
        removeRules(ruleIdentifiers?: string[], callback?: () => void): void;
        /**
         * Unregisters currently registered rules.
         * @param callback Called when rules were unregistered.
         * If you specify the callback parameter, it should be a function that looks like this:
         * function() {...};
         */
        removeRules(callback?: () => void): void;
        /**
         * Registers rules to handle events.
         * @param rules Rules to be registered. These do not replace previously registered rules.
         * @param callback Called with registered rules.
         * If you specify the callback parameter, it should be a function that looks like this:
         * function(array of Rule rules) {...};
         * Parameter rules: Rules that were registered, the optional parameters are filled with values.
         */
        addRules(rules: Rule[], callback?: (rules: Rule[]) => void): void;
        /**
         * Deregisters an event listener callback from an event.
         * @param callback Listener that shall be unregistered.
         * The callback parameter should be a function that looks like this:
         * function() {...};
         */
        removeListener(callback: () => void): void;
        hasListeners(): boolean;
    }

    /** Description of a declarative rule for handling events. */
    interface Rule {
        /** Optional. Optional priority of this rule. Defaults to 100.  */
        priority?: number;
        /** List of conditions that can trigger the actions. */
        conditions: any[];
        /** Optional. Optional identifier that allows referencing this rule.  */
        id?: string;
        /** List of actions that are triggered if one of the condtions is fulfilled. */
        actions: any[];
        /**
         * Optional.
          * Since Chrome 28.
         * Tags can be used to annotate rules and perform operations on sets of rules.
         */
        tags?: string[];
    }
}

/**
 * Use the chrome.storage API to store, retrieve, and track changes to user data.
 * Permissions:  "storage"
 * @since Chrome 20.
 */
declare module chrome.storage {
    interface StorageArea {
        /**
         * Gets the amount of space (in bytes) being used by one or more items.
         * @param callback Callback with the amount of space being used by storage, or on failure (in which case runtime.lastError will be set).
         * Parameter bytesInUse: Amount of space being used in storage, in bytes.
         */
        getBytesInUse(callback: (bytesInUse: number) => void): void;
        /**
         * Gets the amount of space (in bytes) being used by one or more items.
         * @param key A single key to get the total usage for. Pass in null to get the total usage of all of storage.
         * @param callback Callback with the amount of space being used by storage, or on failure (in which case runtime.lastError will be set).
         * Parameter bytesInUse: Amount of space being used in storage, in bytes.
         */
        getBytesInUse(key: string, callback: (bytesInUse: number) => void): void;
        /**
         * Gets the amount of space (in bytes) being used by one or more items.
         * @param keys A list of keys to get the total usage for. An empty list will return 0. Pass in null to get the total usage of all of storage.
         * @param callback Callback with the amount of space being used by storage, or on failure (in which case runtime.lastError will be set).
         * Parameter bytesInUse: Amount of space being used in storage, in bytes.
         */
        getBytesInUse(keys: string[], callback: (bytesInUse: number) => void): void;
        /**
         * Removes all items from storage.
         * @param callback Optional.
         * Callback on success, or on failure (in which case runtime.lastError will be set).
         */
        clear(callback?: () => void): void;
        /**
         * Sets multiple items.
         * @param items An object which gives each key/value pair to update storage with. Any other key/value pairs in storage will not be affected.
         * Primitive values such as numbers will serialize as expected. Values with a typeof "object" and "function" will typically serialize to {}, with the exception of Array (serializes as expected), Date, and Regex (serialize using their String representation).
         * @param callback Optional.
         * Callback on success, or on failure (in which case runtime.lastError will be set).
         */
        set(items: Object, callback?: () => void): void;
        /**
         * Removes one item from storage.
         * @param key A single key for items to remove.
         * @param callback Optional.
         * Callback on success, or on failure (in which case runtime.lastError will be set).
         */
        remove(key: string, callback?: () => void): void;
        /**
         * Removes items from storage.
         * @param keys A list of keys for items to remove.
         * @param callback Optional.
         * Callback on success, or on failure (in which case runtime.lastError will be set).
         */
        remove(keys: string[], callback?: () => void): void;
        /**
         * Gets one or more items from storage.
         * @param callback Callback with storage items, or on failure (in which case runtime.lastError will be set).
         * Parameter items: Object with items in their key-value mappings.
         */
        get(callback: (items: Object) => void): void;
        /**
         * Gets one or more items from storage.
         * @param key A single key to get. Pass in null to get the entire contents of storage.
         * @param callback Callback with storage items, or on failure (in which case runtime.lastError will be set).
         * Parameter items: Object with items in their key-value mappings.
         */
        get(key: string, callback: (items: Object) => void): void;
        /**
         * Gets one or more items from storage.
         * @param keys A list of keys to get. An empty list or object will return an empty result object. Pass in null to get the entire contents of storage.
         * @param callback Callback with storage items, or on failure (in which case runtime.lastError will be set).
         * Parameter items: Object with items in their key-value mappings.
         */
        get(keys: string[], callback: (items: Object) => void): void;
        /**
         * Gets one or more items from storage.
         * @param keys A dictionary specifying default values. Pass in null to get the entire contents of storage.
         * @param callback Callback with storage items, or on failure (in which case runtime.lastError will be set).
         * Parameter items: Object with items in their key-value mappings.
         */
        get(keys: Object, callback: (items: Object) => void): void;
    }

    interface StorageChange {
        /** Optional. The new value of the item, if there is a new value. */
        newValue?: any;
        /** Optional. The old value of the item, if there was an old value. */
        oldValue?: any;
    }

    interface LocalStorageArea extends StorageArea {
        /** The maximum amount (in bytes) of data that can be stored in local storage, as measured by the JSON stringification of every value plus every key's length. This value will be ignored if the extension has the unlimitedStorage permission. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError. */
        QUOTA_BYTES: number;
    }

    interface SyncStorageArea extends StorageArea {
        /** @deprecated since Chrome 40. The storage.sync API no longer has a sustained write operation quota. */
        MAX_SUSTAINED_WRITE_OPERATIONS_PER_MINUTE: number;
        /** The maximum total amount (in bytes) of data that can be stored in sync storage, as measured by the JSON stringification of every value plus every key's length. Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError. */
        QUOTA_BYTES: number;
        /** The maximum size (in bytes) of each individual item in sync storage, as measured by the JSON stringification of its value plus its key length. Updates containing items larger than this limit will fail immediately and set runtime.lastError. */
        QUOTA_BYTES_PER_ITEM: number;
        /** The maximum number of items that can be stored in sync storage. Updates that would cause this limit to be exceeded will fail immediately and set runtime.lastError. */
        MAX_ITEMS: number;
        /**
         * The maximum number of set, remove, or clear operations that can be performed each hour. This is 1 every 2 seconds, a lower ceiling than the short term higher writes-per-minute limit.
         * Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError.
         */
        MAX_WRITE_OPERATIONS_PER_HOUR: number;
        /**
         * The maximum number of set, remove, or clear operations that can be performed each minute. This is 2 per second, providing higher throughput than writes-per-hour over a shorter period of time.
         * Updates that would cause this limit to be exceeded fail immediately and set runtime.lastError.
         * @since Chrome 40.
         */
        MAX_WRITE_OPERATIONS_PER_MINUTE: number;
    }

    interface StorageChangedEvent extends chrome.events.Event {
        /**
         * @param callback
         * Parameter changes: Object mapping each key that changed to its corresponding storage.StorageChange for that item.
         * Parameter areaName: Since Chrome 22. The name of the storage area ("sync", "local" or "managed") the changes are for.
         */
        addListener(callback: (changes: Object, areaName: string) => void): void;
    }

    /** Items in the local storage area are local to each machine. */
    var local: LocalStorageArea;
    /** Items in the sync storage area are synced using Chrome Sync. */
    var sync: SyncStorageArea;
    /**
     * Items in the managed storage area are set by the domain administrator, and are read-only for the extension; trying to modify this namespace results in an error.
     * @since Chrome 33.
     */
    var managed: StorageArea;

    /** Fired when one or more items change. */
    var onChanged: StorageChangedEvent;
}
