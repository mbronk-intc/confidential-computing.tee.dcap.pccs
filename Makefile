#
# Copyright(c) date1-date2 Intel Corporation
# SPDX-License-Identifier: BSD-3-Clause
#

PCCS_VERSION ?= "9.9.9.9"

.PHONY: deb_sgx_dcap_pccs_pkg
deb_sgx_dcap_pccs_pkg:
	./build_infrastructure/installer/linux/deb/sgx-dcap-pccs/build.sh $(PCCS_VERSION)

.PHONY: rpm_sgx_dcap_pccs_pkg
rpm_sgx_dcap_pccs_pkg:
	./build_infrastructure/installer/linux/rpm/sgx-dcap-pccs/build.sh $(PCCS_VERSION)

clean:
	./build_infrastructure/installer/linux/deb/sgx-dcap-pccs/clean.sh
	./build_infrastructure/installer/linux/rpm/sgx-dcap-pccs/clean.sh