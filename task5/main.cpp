#include <algorithm>
#include <array>
#include <cctype>
#include <iostream>
#include <string>
#include <vector>

namespace {

struct CustomComparator {
    std::array<int, 26> rank{};

    bool operator()(const std::string& left, const std::string& right) const {
        const std::size_t min_length = std::min(left.size(), right.size());
        for (std::size_t i = 0; i < min_length; ++i) {
            const char a = left[i];
            const char b = right[i];
            if (a == b) {
                continue;
            }

            const bool is_upper_a =
                std::isupper(static_cast<unsigned char>(a)) != 0;
            const bool is_upper_b =
                std::isupper(static_cast<unsigned char>(b)) != 0;
            if (is_upper_a != is_upper_b) {
                return !is_upper_a && is_upper_b;
            }

            const int idx_a = std::tolower(static_cast<unsigned char>(a)) - 'a';
            const int idx_b = std::tolower(static_cast<unsigned char>(b)) - 'a';
            const int rank_a = rank[idx_a];
            const int rank_b = rank[idx_b];

            if (rank_a != rank_b) {
                return rank_a < rank_b;
            }
        }

        return left.size() < right.size();
    }
};

}  // namespace

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    std::string permutation;
    std::cin >> permutation;

    int n = 0;
    std::cin >> n;

    CustomComparator comparator;
    for (int i = 0; i < 26; ++i) {
        comparator.rank[permutation[i] - 'a'] = i;
    }

    std::vector<std::string> words(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> words[i];
    }

    std::sort(words.begin(), words.end(), comparator);

    for (const std::string& word : words) {
        std::cout << word << '\n';
    }

    return 0;
}
