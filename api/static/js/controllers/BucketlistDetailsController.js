BucketlistApp.controller('BucketlistDetailsController',
	['$scope', 'BucketlistFactory', '$routeParams', '$window',
	function ($scope, BucketlistFactory, $routeParams, $window) {
		var data = {
			buck_id: $routeParams.buckId
		};

		BucketlistFactory.Bucketlist.getOne(data).$promise.then(
			function (response) {
				$scope.bucketlist = response;
				if (typeof($scope.bucketlist.item) === 'object') {
					if ($scope.bucketlist.item.length > 0) {
						$scope.showBucketlistItems =true;
						$scope.showNTSHBucketlist = false;
					} else {
						$scope.showBucketlistItems =false;
						$scope.showNTSHBucketlist = true;
					}
				}
			},
			function (error) {
				console.log(error);
			}
		);

		$scope.addItem = function () {
			if ($scope.new_item_name) {
				var data = {
					buck_id: $routeParams.buckId,
					name: $scope.new_item_name,
					done: $scope.new_item_status
				};
				BucketlistFactory.Item.create(data)
				.$promise.then(
					function (response) {
						$scope.bucketlist = BucketlistFactory.Bucketlist.getOne({buck_id: data.buck_id});
						var $toastContent = $('<strong style="color: #4db6ac;">Bucketlist item created successfully.</strong>');
						Materialize.toast($toastContent, 5000);
						$scope.new_item_name = "";
						$scope.new_item_status = false;

						if ($scope.showNTSHBucketlist) {
							$scope.showNTSHBucketlist = false;
							$scope.showBucketlistItems = true;
						}
					},
					function (error) {
						console.log(error);
						var $toastContent = $('<strong style="color: #f44336;">Error creating bucketlist item.</strong>');
						Materialize.toast($toastContent, 5000);
					}
				);
			}
			else {
				var $toastContent = $('<strong style="color: #f44336;">Item name not provided.</strong>');
				Materialize.toast($toastContent, 5000);
			}

		};

		$scope.editItem = function(buck_id, item_id) {
			$window.location.href = "#bucketlist/" + buck_id + "/edit/" + item_id + "/";
		}

		$scope.deleteItem = function (item_id) {
			var data = {
				buck_id: $routeParams.buckId,
				item_id: item_id
			};
			swal(
				{
					title: "Are you sure?",
					text: "You will not be able to undo this operation!",
					type: "warning",
					showCancelButton: true,
					confirmButtonColor: "#f44336",
					confirmButtonText: "Yes, delete it!",
					closeOnConfirm: false
				},
				function () {
					BucketlistFactory.ItemDetail.deleteItem(data)
					.$promise.then(
						function (response) {
							swal("Deleted!", "Item " + data.item_id + " in Bucketlist " + data.buck_id + " has been deleted.", "success");
							$scope.bucketlist = BucketlistFactory.Bucketlist.getOne({buck_id: data.buck_id});
						}, function (error) {
							console.log(error);
							if (error.status === 403) {
								sweetAlert("Oops...", "You are not authorized to delete this bucketlist item", "error");
							} else {
								sweetAlert("Oops...", error.statusText, "error");
							}
						}
					);
				}
			);
		}
	}
]);