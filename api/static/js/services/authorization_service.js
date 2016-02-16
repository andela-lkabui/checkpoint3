BucketlistApp.service('AuthorizationService', ['$cookies', '$window', '$rootScope',
	function ($cookies, $window, $rootScope) {
		var service = this;
		service.request = function (config) {
			var token = $cookies.get('Authorization');
			config.headers = config.headers || {}

			if (token) {
				config.headers['Authorization'] = 'JWT ' + $cookies.get('Authorization');
				$rootScope.signOutLabel = "Sign Out, " + $cookies.get('Username');
			}

			return config;
		};

		service.responseError = function (response) {
			console.log(response);

			if (response.status === 401) {
				if (response.data.detail === 'Signature has expired.') {
					$window.location.href = "/#/login/";
					sweetAlert("Your current session has expired!", "Please login again to refresh it.", "error");

				} else if (response.data.detail === 'Authentication credentials were not provided.') {
					sweetAlert("Authentication required!", "You need to be authenticated to perform this action", "error");
					$window.location.href = "/#/login/";
				}

			} else if (response.status === 403) {
				if (response.data.detail === 'You do not have permission to perform this action.') {
					sweetAlert("Write operations denied!", "Only the bucketlist owner is permitted to perform this action.", "error");
				}
			}

		}
	}
])