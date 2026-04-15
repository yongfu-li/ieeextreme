#include <algorithm>
#include <array>
#include <iostream>
#include <string>
#include <vector>

namespace {

int longest_suffix_subsequence_length(
    const std::array<std::vector<int>, 26>& positions,
    const int source_length,
    const std::string& pattern) {
    int pos = source_length;
    int matched = 0;

    for (int i = static_cast<int>(pattern.size()) - 1; i >= 0; --i) {
        const std::vector<int>& arr = positions[pattern[i] - 'a'];
        const auto it = std::lower_bound(arr.begin(), arr.end(), pos);
        if (it == arr.begin()) {
            break;
        }
        --pos = *(it - 1);
        ++matched;
    }

    return matched;
}

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::string s;
    std::cin >> s;

    int q = 0;
    std::cin >> q;

    std::array<std::vector<int>, 26> positions;
    for (int i = 0; i < static_cast<int>(s.size()); ++i) {
        positions[s[i] - 'a'].push_back(i);
    }

    for (int i = 0; i < q; ++i) {
        std::string p;
        std::cin >> p;
        std::cout << longest_suffix_subsequence_length(
                         positions, static_cast<int>(s.size()), p)
                  << '\n';
    }

    return 0;
}
