#include <algorithm>
#include <iostream>
#include <string>
#include <unordered_map>
#include <vector>

int main() {
    std::ios::sync_with_stdio(false);
    std::cin.tie(nullptr);

    int n = 0;
    std::cin >> n;

    std::vector<std::string> permuted_words(n);
    for (int i = 0; i < n; ++i) {
        std::cin >> permuted_words[i];
    }

    std::vector<std::string> sorted_words = permuted_words;
    std::sort(sorted_words.begin(), sorted_words.end());

    std::unordered_map<std::string, int> original_index;
    original_index.reserve(static_cast<std::size_t>(2 * n) + 1U);
    for (int i = 0; i < n; ++i) {
        original_index[sorted_words[i]] = i + 1;  // 1-based index.
    }

    std::vector<int> sigma(n + 1, 0);
    for (int position = 1; position <= n; ++position) {
        const int idx = original_index[permuted_words[position - 1]];
        sigma[idx] = position;
    }

    for (int i = 1; i <= n; ++i) {
        std::cout << sigma[i] << (i == n ? '\n' : ' ');
    }

    return 0;
}
