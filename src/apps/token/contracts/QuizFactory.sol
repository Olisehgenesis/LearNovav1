// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract QuizFactory is Ownable, ReentrancyGuard {
    IERC20 public immutable quizToken;

    struct Quiz {
        address owner;
        string name;
        uint256 tokenReward;
        uint256 totalTokens;
        uint256 takerLimit;
        uint256 takerCount;
        uint256 winnerCount;
        uint256 startDate;
        uint256 endDate;
        bool active;
    }

    mapping(uint256 => Quiz) public quizzes;
    mapping(uint256 => mapping(address => bool)) public hasAttempted;
    uint256 public quizCount;

    event QuizCreated(
        uint256 indexed quizId,
        address indexed owner,
        string name,
        uint256 tokenReward,
        uint256 takerLimit,
        uint256 startDate,
        uint256 endDate
    );
    event QuizUpdated(
        uint256 indexed quizId,
        uint256 tokenReward,
        uint256 takerLimit,
        uint256 startDate,
        uint256 endDate
    );
    event QuizAttempted(
        uint256 indexed quizId,
        address indexed taker,
        bool won,
        uint256 reward
    );

    constructor(address _quizTokenAddress) Ownable(msg.sender) {
        quizToken = IERC20(_quizTokenAddress);
    }

    function createQuiz(
        string memory _name,
        uint256 _tokenReward,
        uint256 _takerLimit,
        uint256 _startDate,
        uint256 _endDate
    ) external nonReentrant {
        require(_tokenReward > 0, "Token reward must be greater than 0");
        require(_startDate < _endDate, "Start date must be before end date");
        require(_endDate > block.timestamp, "End date must be in the future");

        uint256 totalTokens = _tokenReward *
            (_takerLimit == 0 ? 1000 : _takerLimit);
        require(
            quizToken.transferFrom(msg.sender, address(this), totalTokens),
            "Token transfer failed"
        );

        quizCount++;
        quizzes[quizCount] = Quiz({
            owner: msg.sender,
            name: _name,
            tokenReward: _tokenReward,
            totalTokens: totalTokens,
            takerLimit: _takerLimit,
            takerCount: 0,
            winnerCount: 0,
            startDate: _startDate,
            endDate: _endDate,
            active: true
        });

        emit QuizCreated(
            quizCount,
            msg.sender,
            _name,
            _tokenReward,
            _takerLimit,
            _startDate,
            _endDate
        );
    }

    function updateQuiz(
        uint256 _quizId,
        uint256 _newTokenReward,
        uint256 _newTakerLimit,
        uint256 _newStartDate,
        uint256 _newEndDate
    ) external nonReentrant {
        Quiz storage quiz = quizzes[_quizId];
        require(msg.sender == quiz.owner, "Only quiz owner can update");
        require(quiz.active, "Quiz is not active");
        require(
            _newStartDate < _newEndDate,
            "Start date must be before end date"
        );
        require(
            _newEndDate > block.timestamp,
            "End date must be in the future"
        );

        uint256 newTotalTokens = _newTokenReward *
            (_newTakerLimit == 0 ? 1000 : _newTakerLimit);

        if (newTotalTokens > quiz.totalTokens) {
            uint256 additionalTokens = newTotalTokens - quiz.totalTokens;
            require(
                quizToken.transferFrom(
                    msg.sender,
                    address(this),
                    additionalTokens
                ),
                "Token transfer failed"
            );
        } else if (newTotalTokens < quiz.totalTokens) {
            uint256 excessTokens = quiz.totalTokens - newTotalTokens;
            require(
                quizToken.transfer(msg.sender, excessTokens),
                "Token return failed"
            );
        }

        quiz.tokenReward = _newTokenReward;
        quiz.takerLimit = _newTakerLimit;
        quiz.totalTokens = newTotalTokens;
        quiz.startDate = _newStartDate;
        quiz.endDate = _newEndDate;

        emit QuizUpdated(
            _quizId,
            _newTokenReward,
            _newTakerLimit,
            _newStartDate,
            _newEndDate
        );
    }

    function attemptQuiz(uint256 _quizId, bool _won) external nonReentrant {
        Quiz storage quiz = quizzes[_quizId];
        // require(quiz.active, "Quiz is not active");
        // require(block.timestamp <= quiz.endDate, "Quiz has ended");
        // require(
        //     quiz.takerLimit == 0 || quiz.takerCount < quiz.takerLimit,
        //     "Quiz taker limit reached"
        // );
        require(
            !hasAttempted[_quizId][msg.sender],
            "User has already attempted this quiz"
        );

        quiz.takerCount++;
        hasAttempted[_quizId][msg.sender] = true;

        uint256 reward = 0;
        if (_won) {
            reward = quiz.tokenReward;
            require(
                quizToken.transfer(msg.sender, reward),
                "Token reward transfer failed"
            );
            quiz.winnerCount++;
        }

        if (quiz.takerLimit > 0 && quiz.takerCount == quiz.takerLimit) {
            quiz.active = false;
        }

        emit QuizAttempted(_quizId, msg.sender, _won, reward);
    }

    function withdrawRemainingTokens(uint256 _quizId) external nonReentrant {
        Quiz storage quiz = quizzes[_quizId];
        require(msg.sender == quiz.owner, "Only quiz owner can withdraw");
        require(
            !quiz.active || block.timestamp > quiz.endDate,
            "Can only withdraw from inactive or ended quizzes"
        );

        uint256 remainingTokens = quiz.totalTokens -
            (quiz.tokenReward * quiz.winnerCount);
        require(
            quizToken.transfer(msg.sender, remainingTokens),
            "Token withdrawal failed"
        );

        quiz.totalTokens = quiz.tokenReward * quiz.winnerCount;
        quiz.active = false;
    }

    function emergencyWithdraw() external onlyOwner nonReentrant {
        uint256 balance = quizToken.balanceOf(address(this));
        require(
            quizToken.transfer(owner(), balance),
            "Emergency withdrawal failed"
        );
    }
}
